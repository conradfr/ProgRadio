defmodule ProgRadioApi.ListenersCounter do
  use GenServer
  require Logger

  alias ProgRadioApi.Repo
  alias ProgRadioApi.Streams
  alias ProgRadioApi.{ListeningSession, RadioStream}

  @name :listeners_counter

  # 10s
  @refresh 10000

  @timestamp_threshold_seconds 35

  # state:
  # %{
  #   counter: %{channel_name => count}
  #   sessions: %{channel_name => %{listening_session_id => timestamp}}
  # }

  # We re-use the live_song nomenclature
  # Allows to broadcast the data via the live_song channels and mutualize the data by url instead of individual streams

  # ----- Client Interface -----

  def start_link(_args) do
    GenServer.start_link(__MODULE__, %{sessions: %{}, counter: %{}}, name: @name)
  end

  def register_listening_session(%ListeningSession{} = listening_session) do
    stream_code_name = get_channel_name(listening_session)

    GenServer.cast(@name, {:register_listening_session, {stream_code_name, listening_session.id}})
  end

  def register_listening_session(_listening_session), do: :ok

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

    Process.send_after(self(), :refresh_sessions, @refresh)
    Process.send_after(self(), :refresh_counter, @refresh + 5000)

    {:ok, state}
  end

  @impl true
  def handle_cast({:register_listening_session, {stream_code_name, listening_session_id}}, state) do
    unix_timestamp = System.os_time(:second)

    updated_state =
      put_in(
        state,
        [
          :sessions,
          Access.key(stream_code_name, %{listening_session_id => nil}),
          listening_session_id
        ],
        unix_timestamp
      )

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

    Process.send_after(self(), :refresh_sessions, @refresh)

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

    Process.send_after(self(), :refresh_counter, @refresh)

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
