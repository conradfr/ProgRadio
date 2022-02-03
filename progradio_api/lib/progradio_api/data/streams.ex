defmodule ProgRadioApi.Streams do
  @moduledoc """
  The Streams context.
  """

  import Ecto.Query
  use Nebulex.Caching
  alias ProgRadioApi.Repo

  alias ProgRadioApi.Cache
  alias ProgRadioApi.{Radio, RadioStream, Stream, StreamSong}

  @default_limit 40

  # 6h
  @cache_ttl_stream 21_600_000
  # 30s
  @cache_ttl_stream_last 30_000

  @cache_prefix_stream "stream_"
  @cache_prefix_stream_count "stream_count_"

  @decorate cacheable(
              cache: Cache,
              key: "#{@cache_prefix_stream}#{id}",
              opts: [ttl: @cache_ttl_stream]
            )
  def get_one(id) do
    base_query()
    |> where([s], s.id == ^id)
    |> Repo.one()
  end

  # avoid caching random sort
  def get(%{:sort => "random"} = params), do: build_query(params)

  @decorate cacheable(
              cache: Cache,
              key: [@cache_prefix_stream, params],
              opts: [ttl: @cache_ttl_stream_last]
            )
  def get(%{:sort => "last"} = params), do: build_query(params)

  @decorate cacheable(
              cache: Cache,
              key: [@cache_prefix_stream, params],
              opts: [ttl: @cache_ttl_stream]
            )
  def get(params), do: build_query(params)

  @decorate cacheable(
              cache: Cache,
              key: [@cache_prefix_stream_count, params],
              opts: [ttl: @cache_ttl_stream]
            )
  def count(params) do
    base_count_query()
    |> add_country(params)
    |> add_text(params)
    |> Repo.one()
  end

  defp build_query(params) do
    base_query()
    |> add_country(params)
    |> add_text(params)
    |> add_offset(params)
    |> add_sort(params)
    |> Repo.all()
  end

  defp base_query() do
    from s in Stream,
      left_join: rs in RadioStream,
      on: rs.id == s.radio_stream_id,
      left_join: r in Radio,
      on: r.id == rs.radio_id,
      left_join: ss in StreamSong,
      on: ss.id == s.stream_song_id,
      where: s.enabled == true,
      limit: @default_limit,
      select: %{
        code_name: s.id,
        name: s.name,
        img: s.img,
        stream_url: s.stream_url,
        tags: s.tags,
        country_code: s.country_code,
        clicks_last_24h: s.clicks_last_24h,
        type: "stream",
        radio_code_name: fragment("COALESCE(?)", r.code_name),
        img_alt: fragment("COALESCE(?)", r.code_name),
        current_song:
          fragment(
            "CASE WHEN(? IS NOT NULL and ? = TRUE) THEN TRUE ELSE ? END",
            ss.code_name,
            ss.enabled,
            rs.current_song
          ),
        radio_stream_code_name:
          fragment(
            "CASE WHEN(? IS NOT NULL and ? = TRUE) THEN ? ELSE ? END",
            s.stream_song_code_name,
            ss.enabled,
            s.stream_song_code_name,
            rs.code_name
          )
      }
  end

  defp base_count_query() do
    from s in Stream,
      where: s.enabled == true,
      select: count()
  end

  defp add_country(query, %{:country => country_code}) when is_binary(country_code) do
    with country_code_upper <- String.upcase(country_code) do
      query
      |> where([s], s.country_code == ^country_code_upper)
    else
      _ -> query
    end
  end

  defp add_country(query, _) do
    query
  end

  defp add_offset(query, %{:offset => offset}) when is_integer(offset) do
    query
    |> offset(^offset)
  end

  defp add_offset(query, _) do
    query
  end

  defp add_sort(query, %{:sort => sort}) when is_binary(sort) do
    case sort do
      "name" ->
        query
        |> order_by([s], asc: s.name)

      "popularity" ->
        query
        |> order_by([s], desc: s.clicks_last_24h)

      "last" ->
        query
        |> join(:inner, [ls], s in assoc(ls, :listening_session))
        |> order_by([s, rs, r, ss, ls], desc: max(ls.date_time_start))
        |> group_by([s, rs, r, ss, ls], [
          s.id,
          r.code_name,
          ss.code_name,
          ss.enabled,
          rs.current_song,
          rs.code_name
        ])

      "random" ->
        query
        |> order_by(fragment("RANDOM()"))

      _ ->
        query
    end
  end

  defp add_sort(query, _) do
    query
  end

  defp add_text(query, %{:text => text}) when is_binary(text) do
    text_search = "%" <> text <> "%"

    query
    |> where([s], fragment("? ILIKE ? or ? ILIKE ?", s.name, ^text_search, s.tags, ^text_search))
  end

  defp add_text(query, _) do
    query
  end
end
