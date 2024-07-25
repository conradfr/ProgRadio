defmodule ProgRadioApi.SongManager do
  require Logger

  @spec join(String.t(), map()) :: any()
  def join(song_topic, radio_stream_data)

  def join("url:" <> song_topic, _params) do
    case Registry.lookup(SongSongProviderRegistry, "url:" <> song_topic) do
      [] ->
        Logger.debug("server for url #{song_topic} created")

        DynamicSupervisor.start_child(
          ProgRadioApi.SongDynamicSupervisor,
          {ProgRadioApi.SongServer, {"url:" <> song_topic, nil, nil}}
        )

      [{pid, _value}] ->
        Logger.debug("server for url #{song_topic} already exists")
        GenServer.cast(pid, :broadcast)
    end
  end

  def join(song_topic, radio_stream_data) do
    case Registry.lookup(SongSongProviderRegistry, song_topic) do
      [] ->
        Logger.debug("server for topic #{song_topic} created")

        DynamicSupervisor.start_child(
          ProgRadioApi.SongDynamicSupervisor,
          {ProgRadioApi.SongServer,
           {song_topic, radio_stream_data.radio_code_name, radio_stream_data}}
        )

      [{pid, _value}] ->
        Logger.debug("server for topic #{song_topic} already exists")
        GenServer.cast(pid, :broadcast)
    end
  end
end
