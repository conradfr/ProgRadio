defmodule ProgRadioApi.SongManager do
  require Logger

  @spec join(String.t(), map(), pid() | nil ) :: any()
  def join(song_topic, radio_stream_data, caller_pid \\ nil)

  def join("url:" <> song_topic, _params, caller_pid) do
    case Registry.lookup(SongProviderRegistry, "url:" <> song_topic) do
      [] ->
        Logger.debug("server for url #{song_topic} created")

        DynamicSupervisor.start_child(
          ProgRadioApi.SongDynamicSupervisor,
          %{
            id: song_topic,
            start: {ProgRadioApi.SongServer, :start_link, [{"url:" <> song_topic, nil, nil}]},
            restart: :temporary
          }
        )

      [{pid, _value}] ->
        Logger.debug("server for url #{song_topic} already exists")
        if caller_pid != nil, do: GenServer.cast(pid, {:send_last_song_to, caller_pid})
    end
  end

  def join(song_topic, radio_stream_data, caller_pid) do
    case Registry.lookup(SongProviderRegistry, song_topic) do
      [] ->
        Logger.debug("server for topic #{song_topic} created")

        DynamicSupervisor.start_child(
          ProgRadioApi.SongDynamicSupervisor,
          {ProgRadioApi.SongServer,
           {song_topic, radio_stream_data.radio_code_name, radio_stream_data}}
        )

      [{pid, _value}] ->
        Logger.debug("server for topic #{song_topic} already exists")
        if caller_pid != nil, do: GenServer.cast(pid, {:send_last_song_to, caller_pid})
    end
  end
end
