defmodule ProgRadioApi.Schedule do
  @moduledoc """
  The Schedules context.
  """

  import Ecto.Query
  use Nebulex.Caching
  alias ProgRadioApi.Repo

  alias ProgRadioApi.Cache
  alias ProgRadioApi.{Radio, SubRadio, Collection, ScheduleEntry, SectionEntry}

  @timezone "Europe/Paris"

  @cache_prefix_schedule "schedule_"
  # 1 hour
  @cache_ttl_schedule 3_600_000
  # 5 mn
  @cache_ttl_schedule_now 300_000

  @cache_prefix_collection "collection_"
  @cache_ttl_collection 604_800_000

  def list_schedule_collection(day, collection_code_name, now \\ false)
      when is_binary(collection_code_name) do
    radio_code_names_of_collection(collection_code_name)
    |> schedule_of_radios_and_day(day, now)
  end

  def list_schedule_radios(day, radios, now \\ false)

  def list_schedule_radios(day, radios, now) when is_list(radios) and length(radios) > 0 do
    schedule_of_radios_and_day(radios, day, now)
  end

  def list_schedule_radios(day, _radios, now) do
    list_schedule(day, now)
  end

  def list_schedule(day \\ nil, now \\ false)

  def list_schedule(nil, now) do
    NaiveDateTime.local_now()
    |> DateTime.from_naive!("Europe/Paris")
    |> DateTime.to_date()
    |> Date.to_string()
    |> list_schedule(now)
  end

  def list_schedule(day, now) do
    # hopefully cached
    ProgRadioApi.Radios.list_active_radios()
    |> Map.keys()
    |> schedule_of_radios_and_day(day, now)
  end

  @spec schedule_of_radios_and_day(list(), String.t(), boolean) :: map()
  defp schedule_of_radios_and_day(radio_code_names, day, now) do
    {radio_code_names_cached, radio_code_names_not_cached} =
      radio_code_names_cached_or_not_for_day(radio_code_names, day, now)
    cached =
      radio_code_names_cached
      |> Enum.map(fn e ->
        data = Cache.get(get_cache_key(e, day, now))
        {e, data}
      end)
      |> Enum.into(%{})

    cached_nil =
      cached
      |> Enum.filter(fn {_, e} ->
        e == nil
      end)
      |> Enum.map(fn {code_name, _} ->
        code_name
      end)

    not_cached =
      case Kernel.length(radio_code_names_not_cached ++ cached_nil) do
        0 ->
          %{}

        _ ->
          result =
            day
            |> query(now)
            |> where([se, r, sc], r.code_name in ^(radio_code_names_not_cached ++ cached_nil))
            |> Repo.all()
            |> format()

          result
          |> Enum.each(fn {k, e} when is_nil(e) == false and is_map(e) and map_size(e) > 0 ->
            if now == false do
              Cache.put(get_cache_key(k, day, now), e, ttl: get_cache_ttl(now))
            end

            fn {k, e} ->
              nil
              # don't cache
            end
          end)

          result
      end

    Map.merge(cached, not_cached)
  end

  @spec query(String.t(), boolean) :: Ecto.query()
  defp query(day, now) do
    day_start =
      (day <> " 00:00:00")
      |> NaiveDateTime.from_iso8601!()
      |> DateTime.from_naive!(@timezone)
      |> DateTime.shift_zone!("UTC")

    day_end =
      day_start
      |> DateTime.add(86400)

    query =
      from se in ScheduleEntry,
        join: r in Radio,
        on: se.radio_id == r.id,
        left_join: sc in SectionEntry,
        on: sc.schedule_entry_id == se.id,
        inner_join: sr in SubRadio,
        on: sr.id == se.sub_radio_id,
        where: r.active == true,
        #        order_by: [asc: se.date_time_start, asc: sc.date_time_start],
        select: %{
          code_name: r.code_name,
          sub_radio_code_name: sr.code_name,
          title: se.title,
          host: se.host,
          description: se.description,
          picture_url: se.picture_url,
          hash:
            fragment(
              "MD5(CONCAT(?,?,?,?))",
              r.code_name,
              se.title,
              se.date_time_start,
              se.sub_radio_id
            ),
          start_at: fragment("? AT TIME ZONE 'UTC'", se.date_time_start),
          end_at: fragment("? AT TIME ZONE 'UTC'", se.date_time_end),
          duration:
            fragment("EXTRACT('epoch' FROM ? - ?) / 60", se.date_time_end, se.date_time_start),
          start_overflow:
            fragment(
              "CASE WHEN(? AT TIME ZONE 'UTC' < ?) THEN 1 ELSE 0 END",
              se.date_time_start,
              ^day_start
            ),
          end_overflow:
            fragment(
              "CASE WHEN(? AT TIME ZONE 'UTC' > ? AND (EXTRACT(HOUR FROM ? AT TIME ZONE 'UTC') <> 23 OR EXTRACT(MINUTE FROM ? AT TIME ZONE 'UTC') <> 0)) THEN 1 ELSE 0 END",
              se.date_time_end,
              ^day_end,
              se.date_time_end,
              se.date_time_end
            ),
          section_title: sc.title,
          section_picture_url: sc.picture_url,
          section_presenter: sc.presenter,
          section_description: sc.description,
          section_start_at: fragment("? AT TIME ZONE 'UTC'", sc.date_time_start),
          section_hash:
            fragment(
              "MD5(CONCAT(CONCAT(?,?,?,?),?,?))",
              r.code_name,
              se.id,
              se.title,
              se.date_time_start,
              sc.title,
              sc.date_time_start
            )
        }

    case now do
      true ->
        date_time = DateTime.utc_now()

        from se in query,
          where:
            fragment(
              "TIMEZONE('UTC', ?) <= ? AND TIMEZONE('UTC', ?) >= ?",
              se.date_time_start,
              ^date_time,
              se.date_time_end,
              ^date_time
            )

      _ ->
        from se in query,
          where:
            fragment(
              "(TIMEZONE('UTC', ?) >= ? AND TIMEZONE('UTC', ?) < ?) OR (TIMEZONE('UTC', ?) > ? AND TIMEZONE('UTC', ?) <= ?)",
              se.date_time_start,
              ^day_start,
              se.date_time_start,
              ^day_end,
              se.date_time_end,
              ^day_start,
              se.date_time_end,
              ^day_end
            )
    end
  end

  defp format(data) do
    radio_schedule =
      data
      |> Stream.map(fn e -> {e.code_name, e.sub_radio_code_name} end)
      |> Stream.uniq()
      |> Enum.reduce(%{}, fn
        {radio_code_name, sub_radio_code_name}, acc when is_map_key(acc, radio_code_name) ->
          case Map.get(acc[radio_code_name], sub_radio_code_name) do
            nil -> put_in(acc, [radio_code_name, sub_radio_code_name], %{})
            _ -> acc
          end

        {radio_code_name, sub_radio_code_name}, acc ->
          Map.put(acc, radio_code_name, %{sub_radio_code_name => %{}})
      end)

    radio_schedule_with_shows =
      data
      |> Enum.reduce(radio_schedule, fn e, acc ->
        # add in schedule_entry not already there
        case Map.has_key?(acc[e.code_name][e.sub_radio_code_name], e.hash) do
          false ->
            schedule_entry = %{
              hash: e.hash,
              start_at: e.start_at,
              start_overflow: e.start_overflow,
              end_at: e.end_at,
              end_overflow: e.end_overflow,
              title: e.title,
              host: e.host,
              description: e.description,
              picture_url: e.picture_url,
              duration: e.duration,
              sections: []
            }

            put_in(acc, [e.code_name, e.sub_radio_code_name, e.hash], schedule_entry)

          true ->
            acc
        end
      end)

    data
    |> Stream.filter(fn e -> e.section_title != nil end)
    |> Enum.reduce(radio_schedule_with_shows, fn e, acc ->
      section_entry = %{
        hash: e.section_hash,
        title: e.section_title,
        presenter: e.section_presenter,
        description: e.section_description,
        picture_url: e.section_picture_url,
        start_at: e.section_start_at
      }

      (acc[e.code_name][e.sub_radio_code_name][e.hash].sections ++ [section_entry])
      |> (&put_in(acc, [e.code_name, e.sub_radio_code_name, e.hash, :sections], &1)).()
    end)
  end

  @spec radio_code_names_cached_or_not_for_day(list(), String.t(), boolean) :: tuple()
  defp radio_code_names_cached_or_not_for_day(radio_code_names, day, now) do
    cache_keys = Cache.all(nil, return: :key)

    code_names_cached =
      radio_code_names
      |> Enum.filter(fn e ->
        Enum.member?(cache_keys, get_cache_key(e, day, now))
      end)

    {code_names_cached, radio_code_names -- code_names_cached}
  end

  @spec radio_code_names_of_collection(String.t()) :: list()
  @decorate cacheable(
              cache: Cache,
              key: "#{@cache_prefix_collection}#{collection_code_name}",
              opts: [ttl: @cache_ttl_collection]
            )
  defp radio_code_names_of_collection(collection_code_name) do
    query =
      from r in Radio,
        join: c in Collection,
        on: r.collection_id == c.id,
        where: r.active == true,
        where: c.code_name == ^collection_code_name,
        select: r.code_name

    Repo.all(query)
  end

  defp get_cache_key(code_name, day, now) do
    now_str =
      if now == true do
        "_now"
      else
        ""
      end

    @cache_prefix_schedule <> day <> now_str <> "_" <> code_name
  end

  # todo separate today / past day ttls, but currently past days are accessed by bots in Symfony side anyway
  defp get_cache_ttl(now) when now == true, do: @cache_ttl_schedule_now
  defp get_cache_ttl(_now), do: @cache_ttl_schedule
end
