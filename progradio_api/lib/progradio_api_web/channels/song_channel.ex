defmodule ProgRadioApiWeb.SongChannel do
  import Ecto.Query, only: [from: 2, dynamic: 2]
  use Phoenix.Channel
  use Nebulex.Caching

  alias ProgRadioApiWeb.Presence
  alias ProgRadioApi.Repo
  alias ProgRadioApi.Cache
  alias ProgRadioApi.{StreamSong, Stream}

  @cache_prefix_stream_song "channel_stream_song_"
  # 1h
  @cache_ttl_ms 3_600_000

  # TODO migrate to stream_id based channel

  def join("song:" <> song_code_name, _params, socket) do
    case get_stream_song(song_code_name) do
      nil ->
        {:error, "not available"}

      data ->
        send(self(), {:after_join, "song:" <> song_code_name, data})
        {:ok, socket}
    end
  end

  def join("url:" <> url, _params, socket) do
    case URI.parse(url) do
      url_parsed when url_parsed.host == nil ->
        {:error, "not available"}

      _ ->
        send(self(), {:after_join, "url:" <> url, nil})
        {:ok, socket}
    end
  end

  def handle_info({:after_join, song_topic, stream_data}, socket) do
    {:ok, _} =
      Presence.track(self(), song_topic, :rand.uniform(), %{
        online_at: inspect(System.system_time(:second))
      })

    ProgRadioApi.SongManager.join(song_topic, stream_data, self())
    {:noreply, socket}
  end

  # sent by song server (if already exists) when user join channel
  def handle_info({:push_song, event, song_data}, socket) do
    push(socket, event, song_data)
    {:noreply, socket}
  end

  intercept ["presence_diff"]

  # we don't need to send presence_diff as it's only used by internal service
  def handle_out("presence_diff", _msg, socket) do
    {:noreply, socket}
  end

  # ----- Internal -----

  @spec get_stream_song(String.t()) :: any()
  @decorate cacheable(
              cache: Cache,
              key: "#{@cache_prefix_stream_song}#{code_name}",
              opts: [ttl: @cache_ttl_ms]
            )
  defp get_stream_song(code_name) do
    # we need to test both combination if there's more than one underscore
    # until we migrate to stream id
    {id_first, name_first} = split_at_first(code_name)
    {id_last, name_last} = split_at_last(code_name)

    query =
      from(s in Stream,
        join: ss in StreamSong,
        on: ss.id == s.stream_song_id,
        select: %{
          radio_code_name: ss.code_name,
          radio_stream_code_name: s.stream_song_code_name,
          id: ss.id,
          type: "stream_song"
        },
        where: ^build_where(id_first, name_first, id_last, name_last),
        order_by: [desc: s.score],
        limit: 1
      )

    Repo.one(query)
  end

  defp split_at_first(code_name) do
    case Regex.run(~r/^([^_]+)_(.*)$/, code_name) do
      [_, id, name] -> {id, name}
      _ -> {code_name, code_name}
    end
  end

  defp split_at_last(code_name) do
    case Regex.run(~r/^(.*)_([^_]+)$/, code_name) do
      [_, id, name] -> {id, name}
      _ -> {code_name, code_name}
    end
  end

  # both were the same (probably only one underscore)
  defp build_where(song_id, song_code_name, song_id, song_code_name) do
    dynamic(
      [s, ss],
      ((ss.code_name == ^song_id and s.stream_url == ^song_code_name) or
         (ss.code_name == ^song_id and s.stream_song_code_name == ^song_code_name)) and
        ss.enabled == true
    )
  end

  # they were different
  defp build_where(id_first, name_first, id_last, name_last) do
    dynamic(
      [s, ss],
      ((ss.code_name == ^id_first and s.stream_url == ^name_first) or
         (ss.code_name == ^id_first and s.stream_song_code_name == ^name_first) or
         (ss.code_name == ^id_last and s.stream_url == ^name_last) or
         (ss.code_name == ^id_last and s.stream_song_code_name == ^name_last)) and
        ss.enabled == true
    )
  end
end
