defmodule ProgRadioApi.SongManager do
  import Ecto.Query, only: [from: 2]
  require Logger

  alias ProgRadioApi.Repo
  alias ProgRadioApi.Cache
  alias ProgRadioApi.{Stream, StreamSong}

  @most_popular_number_of_server 96
  @persistent_topics_cache_key "song_manager_persistent_topics"

  @spec join(String.t(), map(), pid() | nil) :: any()
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

  # Pre-warms the SongServer for the most popular streams
  def launch_most_popular_streams_song_server() do
    topics_and_data =
      most_popular_streams()
      |> Enum.map(&build_topic_and_data/1)
      |> Enum.reject(&is_nil/1)

    # Store the topics first so the servers are marked persistent before they run
    # their first presence check.
    topics_and_data
    |> Enum.map(fn {topic, _data} -> topic end)
    |> MapSet.new()
    |> (&Cache.put(@persistent_topics_cache_key, &1)).()

    Enum.each(topics_and_data, fn {topic, data} -> join(topic, data) end)

    Logger.info(
      "SongManager: launched #{length(topics_and_data)} most popular streams song servers"
    )
  end

  @spec persistent_topic?(String.t()) :: boolean()
  def persistent_topic?(song_topic) do
    case Cache.get(@persistent_topics_cache_key) do
      %MapSet{} = topics -> MapSet.member?(topics, song_topic)
      _ -> false
    end
  end

  @spec most_popular_streams() :: [map()]
  defp most_popular_streams() do
    query =
      from(s in Stream,
        left_join: ss in StreamSong,
        on: ss.id == s.stream_song_id,
        where: s.enabled == true and s.banned == false and is_nil(s.redirect_to),
        order_by: [desc: s.score],
        limit: @most_popular_number_of_server,
        select: %{
          stream_url: s.stream_url,
          stream_song_code_name: s.stream_song_code_name,
          song_enabled: ss.enabled,
          song_code_name: ss.code_name,
          song_id: ss.id
        }
      )

    Repo.all(query)
  end

  @spec build_topic_and_data(map()) :: {String.t(), map() | nil} | nil
  defp build_topic_and_data(%{
         song_enabled: true,
         song_code_name: song_code_name,
         stream_song_code_name: stream_song_code_name,
         song_id: song_id
       })
       when is_binary(song_code_name) and is_binary(stream_song_code_name) do
    topic = "song:" <> song_code_name <> "_" <> stream_song_code_name

    data = %{
      radio_code_name: song_code_name,
      radio_stream_code_name: stream_song_code_name,
      id: song_id,
      type: "stream_song"
    }

    {topic, data}
  end

  # Fallback -> "url:" topic (reads the stream metadata directly)
  defp build_topic_and_data(%{stream_url: stream_url}) when is_binary(stream_url) do
    {"url:" <> stream_url, nil}
  end

  defp build_topic_and_data(_), do: nil
end
