defmodule ProgRadioApiWeb.ChatChannel do
  import Ecto.Query, only: [from: 2]
  use Phoenix.Channel, log_join: :debug
  use Nebulex.Caching

  require Logger

  alias ProgRadioApiWeb.Presence
  alias ProgRadioApi.Repo
  alias ProgRadioApi.Cache
  alias ProgRadioApi.Stream
  alias ProgRadioApi.Utils.ChatUtils

  @cache_prefix_stream_exist "channel_chat_"
  # 1h
  @cache_ttl_ms 3_600_000

  # last messages of each chat, sent to the users joining it (redis list, newest first)
  @history_key_prefix "chat_history_"
  @history_max_msgs 10
  # 1 day, refreshed by each new message
  @history_ttl_s 86_400

  def join("chat:" <> stream_id, params, socket) do
    # uuid checked first: a non uuid id would raise an Ecto.Query.CastError,
    # and it keeps random topics out of the stream_exists? cache
    with {:ok, stream_id} <- Ecto.UUID.cast(stream_id),
         true <- stream_exists?(stream_id) do
      # presence key: unique per channel join, the same name can be used by several users
      presence_key = Ecto.UUID.generate()

      socket =
        socket
        |> assign(:presence_key, presence_key)
        |> assign(:stream_id, stream_id)
        |> assign(:name, ChatUtils.sanitize_name(Map.get(params, "name")))
        # timestamps (monotonic ms) of the last accepted messages, for the rate limit
        |> assign(:msg_times, [])

      send(self(), :after_join)
      {:ok, %{key: presence_key, messages: get_history(stream_id)}, socket}
    else
      _ -> {:error, %{reason: "not available"}}
    end
  end

  def handle_info(:after_join, socket) do
    # tracked on the channel topic, so joins/leaves are broadcast to clients as "presence_diff"
    {:ok, _} =
      Presence.track(socket, socket.assigns.presence_key, %{
        name: socket.assigns.name,
        online_at: System.system_time(:second)
      })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  def handle_in("update:name", %{"name" => name}, socket) do
    name = ChatUtils.sanitize_name(name)

    {:ok, _} =
      Presence.update(socket, socket.assigns.presence_key, fn meta ->
        Map.put(meta, :name, name)
      end)

    {:reply, {:ok, %{name: name}}, assign(socket, :name, name)}
  end

  # Invalid, rate limited and filtered messages are all silently dropped: the sender
  # already displays it locally, so they can't tell it hasn't been broadcast
  def handle_in("new:msg", %{"msg" => msg, "ctrl" => ctrl}, socket)
      when is_binary(msg) and is_integer(ctrl) do
    msg = String.trim(msg)

    with true <- ChatUtils.valid_msg?(msg),
         {:ok, msg_times} <- ChatUtils.check_rate_limit(socket.assigns.msg_times) do
      socket = assign(socket, :msg_times, msg_times)

      # checked after the rate limit, so filtered messages are counted too
      if ChatUtils.filtered?(socket.assigns.name, msg) do
        emit_msg_telemetry(:filtered)
      else
        id = Ecto.UUID.generate()
        datetime = DateTime.utc_now() |> DateTime.truncate(:second)

        message = %{
          id: id,
          user: socket.assigns.name,
          msg: msg,
          datetime: datetime,
          ctrl: ctrl
        }

        # saved before the broadcast: a user joining in between gets it twice (deduplicated
        # by id by the client) rather than not at all
        save_to_history(socket.assigns.stream_id, message)
        broadcast!(socket, "new:msg", message)

        emit_msg_telemetry(:sent)
      end

      {:noreply, socket}
    else
      false ->
        {:noreply, socket}

      {:error, msg_times} ->
        emit_msg_telemetry(:rate_limited)
        {:noreply, assign(socket, :msg_times, msg_times)}
    end
  end

  # malformed payload (only possible from a client not using the web app)
  def handle_in("new:msg", _payload, socket), do: {:noreply, socket}

  #  # sent by song server (if already exists) when user join channel
  #  def handle_info({:push_song, event, song_data}, socket) do
  #    push(socket, event, song_data)
  #    {:noreply, socket}
  #  end

  # ----- Internal -----

  # one event, the outcome as a tag (see ProgRadioApiWeb.Telemetry metrics)
  @spec emit_msg_telemetry(:sent | :filtered | :rate_limited) :: :ok
  defp emit_msg_telemetry(status) do
    :telemetry.execute([:prog_radio_api, :chat, :message], %{count: 1}, %{status: status})
  end

  # oldest first, like the messages received afterwards.
  # A redis error only means no history, it must not prevent joining
  @spec get_history(String.t()) :: [map()]
  defp get_history(stream_id) do
    case Redix.command(:redix, [
           "LRANGE",
           @history_key_prefix <> stream_id,
           0,
           @history_max_msgs - 1
         ]) do
      {:ok, messages} ->
        messages |> Enum.reverse() |> Enum.map(&Jason.decode!/1)

      {:error, error} ->
        Logger.warning("Chat - history read failed for #{stream_id}: #{inspect(error)}")
        []
    end
  end

  # a redis error must not crash the channel (it would disconnect the sender)
  @spec save_to_history(String.t(), map()) :: :ok
  defp save_to_history(stream_id, message) do
    key = @history_key_prefix <> stream_id

    case Redix.transaction_pipeline(:redix, [
           ["LPUSH", key, Jason.encode!(message)],
           ["LTRIM", key, 0, @history_max_msgs - 1],
           ["EXPIRE", key, @history_ttl_s]
         ]) do
      {:ok, _} ->
        :ok

      {:error, error} ->
        Logger.warning("Chat - history save failed for #{stream_id}: #{inspect(error)}")
        :ok
    end
  end

  @spec stream_exists?(String.t()) :: boolean()
  @decorate cacheable(
              cache: Cache,
              key: "#{@cache_prefix_stream_exist}#{stream_id}",
              opts: [ttl: @cache_ttl_ms]
            )
  defp stream_exists?(stream_id) when is_binary(stream_id) do
    query =
      from(s in Stream,
        where:
          s.banned != true and s.enabled == true and is_nil(s.redirect_to) and
            s.id == ^stream_id
      )

    Repo.exists?(query)
  end
end
