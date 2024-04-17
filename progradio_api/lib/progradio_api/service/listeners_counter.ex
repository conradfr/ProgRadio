defmodule ProgRadioApi.ListenersCounter do
  use GenServer
  require Logger

  alias ProgRadioApi.Repo
  alias ProgRadioApi.Cache
  alias ProgRadioApi.Streams
  alias ProgRadioApi.{ListeningSession, RadioStream}

  @name :listeners_counter

  # 10s
  @refresh_sessions 10000
  @refresh_counter 15000

  @timestamp_threshold_seconds 32

  @redis_ttl 172800

  # state:
  # %{
  #   counter: %{channel_name => count}
  #   sessions: %{channel_name => %{listening_session_id => timestamp}}
  # }

  # ----- Client Interface -----

  def start_link(_args) do
    GenServer.start_link(__MODULE__, %{sessions: %{}, counter: %{}}, name: @name)
  end

  def register_listening_session(listening_session, is_update)

  def register_listening_session(%ListeningSession{} = listening_session, is_update) do
    stream_code_name = get_channel_name(listening_session)

    GenServer.cast(
      @name,
      {:register_listening_session, {stream_code_name, listening_session}, is_update}
    )
  end

  def register_listening_session(_listening_session, _is_update), do: :ok

  def remove_listening_session(listening_session)

  def remove_listening_session(%ListeningSession{} = listening_session) do
    stream_code_name = get_channel_name(listening_session)

    GenServer.cast(@name, {:remove_listening_session, {stream_code_name, listening_session.id}})
  end

  def remove_listening_session(_listening_session), do: :ok

  def send_counter_of_stream(stream_code_name) when is_binary(stream_code_name) do
    GenServer.cast(@name, {:send_counter_of, stream_code_name})
  end

  def send_counter_of_stream(_stream_code_name), do: :ok

  #  def get_count_of_stream(stream_code_name) when is_binary(stream_code_name) do
  #    GenServer.call(@name, {:count_of, stream_code_name})
  #  end
  #
  #  def get_count_of_stream(_stream_code_name), do: 0

  # ----- Server callbacks -----

  @impl true
  def init(state) do
    Logger.info("Listeners counter: starting ...")

    Process.send_after(self(), :refresh_sessions, @refresh_sessions)
    Process.send_after(self(), :refresh_counter, @refresh_counter)

    {:ok, state}
  end

  @impl true
  def handle_cast(
        {:register_listening_session, {stream_code_name, listening_session}, is_update},
        state
      ) do
    unix_timestamp = System.os_time(:second)

    updated_state =
      put_in(
        state,
        [
          :sessions,
          Access.key(stream_code_name, %{listening_session.id => nil}),
          listening_session.id
        ],
        unix_timestamp
      )

    unless is_update == true do
      Process.send(self(), {:refresh_counter, stream_code_name}, [])

      # We store sessions in redis for popularity sort (consolidated per day)
      # We restrict to one combo ip/radio per day
      date_string = Date.utc_today() |> Date.to_iso8601()
      ip_key = "#{date_string}-#{stream_code_name}-#{listening_session.ip_address}"

      if Cache.has_key?(ip_key) == false or Redix.command!(:redix, ["GET", ip_key]) == nil do
        Redix.command!(:redix, ["SET", ip_key, "1", "EX", @redis_ttl])
        Cache.put(ip_key, "1", ttl: (@redis_ttl * 1000))

        Redix.command!(:redix, ["ZINCRBY", "#{date_string}-listens", 1, stream_code_name])
        Redix.command!(:redix, ["EXPIRE", "#{date_string}-listens", @redis_ttl, "NX"])
      end

    end

    {:noreply, updated_state}
  end

  @impl true
  def handle_cast({:remove_listening_session, {stream_code_name, listening_session_id}}, state) do
    {_whatever, updated_state} =
      pop_in(
        state,
        [
          :sessions,
          Access.key(stream_code_name, %{listening_session_id => nil}),
          listening_session_id
        ]
      )

    Process.send(self(), {:refresh_counter, stream_code_name}, [])

    {:noreply, updated_state}
  end

  @impl true
  def handle_cast({:send_counter_of, stream_code_name}, state) do
    case Map.get(state.counter, stream_code_name) do
      nil ->
        0

      counter ->
        ProgRadioApiWeb.Endpoint.broadcast!(
          "listeners:" <> stream_code_name,
          "counter_update",
          %{name: stream_code_name, listeners: counter}
        )
    end

    {:noreply, state}
  end

  @impl true
  def handle_info(:refresh_sessions, state) do
    unix_timestamp = System.os_time(:second)

    cleaned_sessions =
      Enum.reduce(state.sessions, %{}, fn {stream_code_name, sessions}, acc ->
        filtered_sessions =
          sessions
          |> Enum.filter(fn {_listening_session_id, timestamp} ->
            unix_timestamp - timestamp < @timestamp_threshold_seconds
          end)
          |> Enum.into(%{})

        case map_size(filtered_sessions) do
          0 -> acc
          _ -> Map.put(acc, stream_code_name, filtered_sessions)
        end
      end)

    updated_state = Map.put(state, :sessions, cleaned_sessions)

    Process.send_after(self(), :refresh_sessions, @refresh_sessions)

    {:noreply, updated_state}
  end

  # todo use this function for the global :refresh_counter ?
  @impl true
  def handle_info({:refresh_counter, stream_code_name}, state) do
    count =
      state
      |> Map.get(:sessions)
      |> Map.get(stream_code_name, %{})
      |> Kernel.map_size()

    ProgRadioApiWeb.Endpoint.broadcast!(
      "listeners:" <> stream_code_name,
      "counter_update",
      %{name: stream_code_name, listeners: count}
    )

    updated_state =
      put_in(
        state,
        [
          :counter,
          Access.key(stream_code_name, 0)
        ],
        count
      )

    {:noreply, updated_state}
  end

  @impl true
  def handle_info(:refresh_counter, state) do
    # we save the ids for broadcast after refresh, to send those which are now 0 as well
    counters_code_name =
      state
      |> Map.get(:counter, %{})
      |> Enum.map(fn {code_name, _counter} -> code_name end)

    counter =
      state
      |> Map.get(:sessions)
      |> Enum.reduce([], fn {stream_code_name, sessions}, acc ->
        case map_size(sessions) do
          0 -> acc
          number -> [{stream_code_name, number} | acc]
        end
      end)
      |> Enum.into(%{})

    updated_state = Map.put(state, :counter, counter)

    Process.send_after(self(), :refresh_counter, @refresh_counter)

    spawn(fn ->
      counters_code_name
      |> Stream.each(fn stream_code_name ->
        ProgRadioApiWeb.Endpoint.broadcast!(
          "listeners:" <> stream_code_name,
          "counter_update",
          %{name: stream_code_name, listeners: Map.get(counter, stream_code_name, 0)}
        )
      end)
      |> Enum.to_list()
    end)

    {:noreply, updated_state}
  end

  #  @impl true
  #  def handle_call({:count_of, stream_code_name}, _from, %{counter: counter} = state) do
  #    count = Map.get(counter, stream_code_name, 0)
  #
  #    {:reply, count, state}
  #  end

  defp get_channel_name(%ListeningSession{} = listening_session) do
    case Map.get(listening_session, :radio_stream_id) do
      nil ->
        stream = Streams.get_one_preload(listening_session.stream_id)

        channel_name =
          cond do
            Map.get(stream, :stream_song) != nil ->
              stream.stream_song_code_name

            Map.get(stream, :radio_stream) != nil ->
              stream.radio_stream.code_name

            true ->
              nil
          end

        # return default if nil
        channel_name || stream.id

      radio_stream_id ->
        RadioStream
        |> Repo.get!(radio_stream_id)
        |> Map.get(:code_name)
    end
  end
end
