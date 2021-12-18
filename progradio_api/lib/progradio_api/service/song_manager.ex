defmodule ProgRadioApi.SongManager do
  import Ecto.Query, only: [from: 2]
  require Logger
  alias ProgRadioApi.Repo
  alias ProgRadioApi.{Radio, RadioStream, Collection}

  @permanent_collection ["nationwide"]

  def join_permanent() do
    query =
      from(rs in RadioStream,
        join: r in Radio,
        on: r.id == rs.radio_id,
        join: c in Collection,
        on: c.id == r.collection_id,
        select: %{
          radio_code_name: r.code_name,
          radio_stream_code_name: rs.code_name,
          id: rs.id,
          type: "radio_stream",
          collection_code_name: c.code_name
        },
        where:
          r.active == true and rs.main == true and rs.enabled == true and
            rs.current_song == true and c.code_name in ^@permanent_collection
      )

    Repo.all(query)
    |> Enum.each(fn data ->
      join("song:" <> data.radio_stream_code_name, data, true)
    end)
  end

  @spec join(String.t(), map(), bool()) :: any()
  def join(song_topic, radio_stream_data, permanent \\ false)

  def join("url:" <> song_topic, _params, _permanent) do
    case Registry.lookup(SongSongProviderRegistry, song_topic) do
      [] ->
        DynamicSupervisor.start_child(
          ProgRadioApi.SongDynamicSupervisor,
          {ProgRadioApi.SongServer, {"url:" <> song_topic, nil, false, nil}}
        )

      [{pid, _value}] ->
        GenServer.cast(pid, :broadcast)
    end
  end

  def join(song_topic, radio_stream_data, permanent) do
    case Registry.lookup(SongSongProviderRegistry, song_topic) do
      [] ->
        DynamicSupervisor.start_child(
          ProgRadioApi.SongDynamicSupervisor,
          {ProgRadioApi.SongServer,
           {song_topic, radio_stream_data.radio_code_name, permanent, radio_stream_data}}
        )

      [{pid, _value}] ->
        GenServer.cast(pid, :broadcast)
    end
  end
end
