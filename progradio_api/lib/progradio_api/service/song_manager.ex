defmodule ProgRadioApi.SongManager do
  import Ecto.Query, only: [from: 2]
  require Logger
  alias ProgRadioApi.Repo
  alias ProgRadioApi.{Radio, RadioStream, Collection}

  @spec join(String.t(), map()) :: any()
  def join(song_topic, radio_stream_data)

  def join("url:" <> song_topic, _params) do
    case Registry.lookup(SongSongProviderRegistry, song_topic) do
      [] ->
        DynamicSupervisor.start_child(
          ProgRadioApi.SongDynamicSupervisor,
          {ProgRadioApi.SongServer, {"url:" <> song_topic, nil, nil}}
        )

      [{pid, _value}] ->
        GenServer.cast(pid, :broadcast)
    end
  end

  def join(song_topic, radio_stream_data) do
    case Registry.lookup(SongSongProviderRegistry, song_topic) do
      [] ->
        DynamicSupervisor.start_child(
          ProgRadioApi.SongDynamicSupervisor,
          {ProgRadioApi.SongServer,
           {song_topic, radio_stream_data.radio_code_name, radio_stream_data}}
        )

      [{pid, _value}] ->
        GenServer.cast(pid, :broadcast)
    end
  end
end
