defmodule ProgRadioApi.Streams do
  @moduledoc """
  The Streams context.
  """

  # TODO : refactor to different files as this is getting big

  require Logger
  import Ecto.Query
  use Nebulex.Caching

  alias ProgRadioApi.Repo

  alias ProgRadioApi.Cache
  alias ProgRadioApi.{Radio, RadioStream, Stream, StreamOverloading, StreamCheck, StreamSong}

  @default_limit 48

  @check_batch_size 20
  @check_timeout 60_000
  @check_task_timeout 90_000

  # 1h
  @cache_ttl_stream 3_600_000
  # 15s
  @cache_ttl_stream_last 15_000
  # 1d
  @cache_ttl_countries 86_400_000

  @cache_prefix_stream "stream_"
  @cache_prefix_stream_count "stream_count_"
  @cache_prefix_countries "countries_"

  # ---------- DATA ----------

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

  @decorate cacheable(
              cache: Cache,
              key: "#{@cache_prefix_stream}_preload#{id}",
              opts: [ttl: @cache_ttl_stream]
            )
  def get_one_preload(id) do
    query =
      from s in Stream,
        where: s.id == ^id,
        preload: [:radio_stream, :stream_song]

    Repo.one(query)
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

  @decorate cacheable(
              cache: Cache,
              key: "#{@cache_prefix_countries}#{locale}",
              opts: [ttl: @cache_ttl_countries]
            )
  def get_countries(locale) when is_binary(locale) do
    query =
      from s in Stream,
        distinct: s.country_code,
        select: fragment("upper(?)", s.country_code),
        where: not is_nil(s.country_code),
        where: s.country_code != "",
        order_by: [asc: s.country_code]

    result =
      query
      |> Repo.all()

    # Process:
    # 1. a map of country_name => country_code
    # 2. sort a country_name list by the country name based on locale rules
    # 3. reconstruct a list of (sorted) tuple {map country_code, country_name}

    result_with_names =
      result
      |> Enum.reduce(%{}, fn country_code, acc ->
        case ProgRadioApi.Cldr.Territory.from_territory_code(country_code, locale: locale) do
          {:ok, country_name} ->
            Map.put(acc, country_name, country_code)

          _ ->
            acc
        end
      end)

    result_with_names
    |> Map.keys()
    |> Cldr.Collation.sort(casing: :insensitive)
    |> Enum.reverse()
    |> Enum.reduce([], fn country_name, acc ->
      country_code = Map.get(result_with_names, country_name)
      [{country_code, country_name} | acc]
    end)
  end

  # ---------- ERROR ----------

  def register_streaming_error(stream_id, reason \\ nil) when is_binary(stream_id) do
    with %Stream{} = stream <- Repo.get(Stream, stream_id),
         true <- stream.enabled do
      # we insert a new entry or increase the count if already set for this stream
      on_conflict = [
        set: [
          playing_error_reason: reason,
          playing_error: dynamic([s], fragment("? + ?", s.playing_error, 1))
        ]
      ]

      stream
      |> Map.put(:playing_error, 1)
      |> Map.put(:playing_error_reason, reason)
      |> Repo.insert(
        on_conflict: on_conflict,
        conflict_target: [:id]
      )
    else
      _ -> {:ok, nil}
    end
  end

  def reset_streaming_error(stream_id) when is_binary(stream_id) do
    with %Stream{} = stream <- Repo.get(Stream, stream_id) do
      stream
      |> Stream.changeset_playing_error(%{"playing_error" => 0, "playing_error_reason" => nil})
      |> Repo.update()
    else
      _ -> {:ok, nil}
    end
  end

  def reset_streaming_error(_stream_id), do: {:ok, nil}

  # ---------- UTILS ----------

  def get_recently_overload_updated_ids() do
    date_time =
      DateTime.utc_now()
      # 30mn
      |> DateTime.add(-1802)

    query =
      from so in StreamOverloading,
        select: so.id,
        where: so.updated_at > ^date_time

    Repo.all(query)
  end

  def get_recently_modified_progradio() do
    date_time =
      DateTime.utc_now()
      # 1h
      |> DateTime.add(-3602)

    query =
      from s in Stream,
        select: s.id,
        where: s.updated_at > ^date_time and not is_nil(s.original_img)

    Repo.all(query)
  end

  # ---------- INTERNAL ----------

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
      where: s.enabled == true and s.banned == false and is_nil(s.redirect_to),
      limit: @default_limit,
      select: %{
        code_name: s.id,
        name: s.name,
        img: s.img,
        stream_url: fragment("COALESCE(?, ?)", rs.url, s.stream_url),
        force_hls: s.force_hls,
        force_mpd: s.force_mpd,
        tags: s.tags,
        country_code: s.country_code,
        website: s.website,
        clicks_last_24h: s.clicks_last_24h,
        score: s.score,
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
      where: s.enabled == true and s.banned == false and is_nil(s.redirect_to),
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
        |> order_by([s], [desc: s.score, desc: s.clicks_last_24h])

      "last" ->
        query
        |> where(
          [s, rs, r, ss],
          fragment("? < now() at time zone 'utc' + interval '120 second'", s.last_listening_at)
        )
        |> order_by([s, rs, r, ss], desc: max(s.last_listening_at))
        |> group_by([s, rs, r, ss], [
          s.id,
          r.code_name,
          ss.code_name,
          ss.enabled,
          rs.current_song,
          rs.code_name,
          rs.url
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
    text_search =
      text
      |> String.trim()
      |> String.downcase()

    text_search_like =
      text_search
      |> String.replace(" ", "%")
      |> then(fn t -> "%" <> t <> "%" end)

    query
    |> where(
      [s],
      fragment(
        "? % ? or ? % ? or lower(?) LIKE ? or lower(?) LIKE ?",
        s.name,
        ^text_search,
        s.tags,
        ^text_search,
        s.name,
        ^text_search_like,
        s.tags,
        ^text_search_like
      )
    )

    #    search_text = "*:" <> text <> ":*"
    #
    #    query
    #    |> where(
    #      [s],
    #      fragment(
    #        "to_tsvector('progradio_unaccent', ? || ' ' || ?) @@ plainto_tsquery('progradio_unaccent', ?)",
    #        s.name,
    #        s.tags,
    #        ^search_text
    #      )
    #    )
  end

  defp add_text(query, _) do
    query
  end

  # ---------- STATS ----------

  def update_stats_from_previous_day() do
    date_string = Date.utc_today() |> Date.add(-1) |> Date.to_iso8601()
    redis_key = "#{date_string}-listens"
    has_data = Redix.command!(:redix, ["EXISTS", redis_key]) != nil

    Repo.transaction(fn ->
    Ecto.Adapters.SQL.query!(
      Repo,
      "UPDATE stream SET score = 0 where score > 0",
      []
    )

      from(s in Stream,
        left_join: rs in RadioStream,
        on: rs.id == s.radio_stream_id,
        left_join: r in Radio,
        on: r.id == rs.radio_id,
        where: s.enabled == true and is_nil(s.redirect_to) and s.banned == false,
        select: %{
          id: s.id,
          code_name: fragment("COALESCE(?,  ?::text)", rs.code_name, s.id),
          clicks_last_24h: fragment("COALESCE(?,  0)", s.clicks_last_24h)
        }
      )
      |> Repo.all()
      |> Enum.each(fn e ->
        count =
          unless has_data == false do
            Redix.command!(:redix, ["ZMSCORE", redis_key, e.code_name])
            |> hd()
          else
            nil
          end

        score =
          cond do
            is_nil(count) == false ->
              String.to_integer(count)
            true ->
              0
          end

        Ecto.Adapters.SQL.query!(
          Repo,
          "UPDATE stream SET score = $1 where id = $2",
          [score, Ecto.UUID.dump!(e.id)]
        )
      end)
    end, timeout: :infinity)

    :ok
  end

  # ---------- CHECK ----------

  def check(initial_offset \\ 0) do
    total = count_streams_to_check()

    Logger.info("Streams to check: #{total}")

    Range.new(initial_offset, total - initial_offset, @check_batch_size)
    |> Enum.each(fn r ->
      Logger.info("Checking: #{r} to #{r + @check_batch_size}")

      @check_batch_size
      |> get_streams_to_check(r)
      |> Enum.each(fn s ->
        check_stream(s)
      end)
    end)
  end

  defp get_streams_to_check(how_many, offset) do
    query =
      from s in Stream,
        select: s,
        left_join: so in StreamOverloading,
        on: so.id == s.id,
        # where: is_nil(so.id) and s.enabled == true and s.banned == false and is_nil(s.redirect_to),
        where:
          (is_nil(so.enabled) or so.enabled != false) and s.banned == false and
            is_nil(s.redirect_to),
        #        where: s.enabled == true and s.banned == false and is_nil(s.redirect_to),
        order_by: [desc: s.clicks_last_24h],
        limit: ^how_many,
        offset: ^offset

    Repo.all(query)
  end

  defp count_streams_to_check() do
    query =
      from s in Stream,
        select: count(),
        left_join: so in StreamOverloading,
        on: so.id == s.id,
        #        where: is_nil(so.id) and s.enabled == true and s.banned == false and is_nil(s.redirect_to)
        where:
          (is_nil(so.enabled) or so.enabled != false) and s.banned == false and
            is_nil(s.redirect_to)

    Repo.one(query)
  end

  defp check_stream(stream) do
    stream_check = Repo.get(StreamCheck, stream.id) || %StreamCheck{id: stream.id}

    params = %{
      checked_at: DateTime.utc_now() |> DateTime.truncate(:second)
    }

    params =
      if stream.img != nil do
        status =
          File.exists?("#{Application.get_env(:progradio_api, :image_path)}stream/#{stream.img}")

        Map.put(params, :img, status)
      else
        params
      end

    params =
      if stream.website != nil do
        status =
          try do
            # We put it in a task to mitigate websites that are actually audio streams
            task =
              Task.async(fn ->
                Logger.info("checking #{stream.website}")

                try do
                  stream.website
                  |> Req.get!(receive_timeout: @check_timeout)
                  |> Map.get(:status)
                rescue
                  _ -> 666
                end
              end)

            Task.await(task, @check_task_timeout)
          rescue
            _ -> 666
          catch
            :exit, _ ->
              666
          end

        Map.put(params, :website, status == 200)
      else
        params
      end

    params =
      if stream.website != nil and String.starts_with?(stream.website, "http://") do
        status =
          try do
            # We put it in a task to mitigate websites that are actually audio streams
            task =
              Task.async(fn ->
                Logger.info("checking ssl #{stream.website}")

                try do
                  stream.website
                  |> String.replace("http://", "https://", global: false)
                  |> Req.get!(receive_timeout: @check_timeout)
                  |> Map.get(:status)
                rescue
                  _ -> 666
                end
              end)

            Task.await(task, @check_task_timeout)
          rescue
            _ -> 666
          catch
            :exit, _ ->
              666

            _ ->
              666
          end

        Map.put(params, :website_ssl, status == 200)
      else
        params
      end

    params =
      if stream.stream_url != nil do
        status =
          try do
            # We put it in a task to not really dealing with streams
            task =
              Task.async(fn ->
                Logger.info("checking stream #{stream.stream_url}")

                try do
                  stream.website
                  |> Req.get!(receive_timeout: @check_timeout)
                  |> Map.get(:status)
                rescue
                  _ -> 666
                end
              end)

            Task.await(task)
          rescue
            _ -> 666
          catch
            :exit, _ ->
              666
          end

        # for now, we only check 404 for simplicity
        if status == 404 do
          Map.put(params, :stream_url, false)
        else
          Map.put(params, :stream_url, nil)
        end
      else
        params
      end

    stream_check
    |> StreamCheck.changeset(params)
    |> Repo.insert_or_update()
  end
end
