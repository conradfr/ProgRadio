defmodule ProgRadioApi.Schedule do
  @moduledoc """
  The Schedules context.
  """

  import Ecto.Query
  alias ProgRadioApi.Repo

  alias ProgRadioApi.Utils
  alias ProgRadioApi.{Radio, Collection, ScheduleEntry, SectionEntry}

  @timezone "Europe/Paris"

  # two days
  @cache_ttl_schedule 172_800
  @cache_prefix_schedule "schedule_"

  @cache_ttl_collection 604_800
  @cache_prefix_collection "collection_"

  def list_schedule_collection(day, collection_code_name) when is_binary(collection_code_name) do
    radio_code_names_of_collection(collection_code_name)
    |> schedule_of_radios_and_day(day)
  end

  def list_schedule_radios(day, radios) when is_list(radios) and length(radios) > 0 do
    schedule_of_radios_and_day(radios, day)
  end


  def list_schedule_radios(day, _radios) do
    list_schedule(day)
  end

  def list_schedule(day) do
      # hopefully cached
      ProgRadioApi.Radios.list_active_radios()
      |> Map.keys()
      |> schedule_of_radios_and_day(day)
  end

  def list_schedule() do
    NaiveDateTime.local_now()
    |> DateTime.from_naive!("Europe/Paris")
    |> DateTime.to_date()
    |> Date.to_string()
    |> list_schedule()
  end

  @spec schedule_of_radios_and_day(list(), String.t()) :: map()
  defp schedule_of_radios_and_day(radio_code_names, day) do
    cache_key = @cache_prefix_schedule <> day <> "_"

    {radio_code_names_cached, radio_code_names_not_cached} = radio_code_names_cached_or_not_for_day(radio_code_names, day)

    not_cached =
      case Kernel.length(radio_code_names_not_cached) do
        0 -> %{}
        _ ->
          result =
            day
            |> query()
            |> where([se, r, sc], r.code_name in ^radio_code_names_not_cached)
            |> Repo.all()
            |> format()

          # put in cache
          result
          |> Enum.each(fn {k, e} ->
            Cachex.put(:progradio_cache, cache_key <> k, e, ttl: @cache_ttl_schedule)
          end)

          result
      end

    cached =
      radio_code_names_cached
      |> Enum.map(fn e ->
        {:ok, data} = Cachex.get(:progradio_cache, cache_key <> e)
        {e, data}
      end)
      |> Enum.into(%{})

    Map.merge(cached, not_cached)
  end

  @spec query(String.t()) :: Ecto.query()
  defp query(day) do
    date_time_start =
      (day <> " 00:00:00")
      |> NaiveDateTime.from_iso8601!()
      |> DateTime.from_naive!(@timezone)
      |> DateTime.shift_zone!("UTC")

    date_time_end =
      date_time_start
      |> DateTime.add(86400)

    from se in ScheduleEntry,
      join: r in Radio,
      on: se.radio_id == r.id,
      left_join: sc in SectionEntry,
      on: sc.schedule_entry_id == se.id,
      where: r.active == true,
      where:
        fragment(
          "(TIMEZONE('UTC', ?) >= ? AND TIMEZONE('UTC', ?) < ?) OR (TIMEZONE('UTC', ?) > ? AND TIMEZONE('UTC', ?) <= ?)",
          se.date_time_start,
          ^date_time_start,
          se.date_time_start,
          ^date_time_end,
          se.date_time_end,
          ^date_time_start,
          se.date_time_end,
          ^date_time_end
        ),
      order_by: [asc: se.date_time_start, asc: sc.date_time_start],
      select: %{
        code_name: r.code_name,
        title: se.title,
        host: se.host,
        description: se.description,
        picture_url: se.picture_url,
        hash: fragment("MD5(CONCAT(?,?,?))", r.code_name, se.title, se.date_time_start),
        start_at: fragment("? AT TIME ZONE 'UTC'", se.date_time_start),
        end_at: fragment("? AT TIME ZONE 'UTC'", se.date_time_end),
        duration:
          fragment("EXTRACT('epoch' FROM ? - ?) / 60", se.date_time_end, se.date_time_start),
        start_overflow:
          fragment(
            "CASE WHEN(? AT TIME ZONE 'UTC' < ?) THEN 1 ELSE 0 END",
            se.date_time_start,
            ^date_time_start
          ),
        end_overflow:
          fragment(
            "CASE WHEN(? AT TIME ZONE 'UTC' > ? AND (EXTRACT(HOUR FROM ? AT TIME ZONE 'UTC') <> 23 OR EXTRACT(MINUTE FROM ? AT TIME ZONE 'UTC') <> 0)) THEN 1 ELSE 0 END",
            se.date_time_end,
            ^date_time_end,
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
            "MD5(CONCAT(CONCAT(?,?,?),?,?))",
            r.code_name,
            se.title,
            se.date_time_start,
            sc.title,
            sc.date_time_start
          )
      }
  end

  defp format(data) do
    radio_schedule =
      data
      |> Enum.map(fn e -> {e.code_name, %{}} end)
      |> Enum.uniq()
      |> Enum.into(%{})

    radio_schedule_with_shows =
      data
      |> Enum.reduce(radio_schedule, fn e, acc ->
        # add in schedule_entry not already there
        case Map.has_key?(acc[e.code_name], e.hash) do
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

            put_in(acc, [e.code_name, e.hash], schedule_entry)

          true ->
            acc
        end
      end)

    data
    |> Enum.filter(fn e -> e.section_title != nil end)
    |> Enum.reduce(radio_schedule_with_shows, fn e, acc ->
      section_entry = %{
        hash: e.section_hash,
        title: e.section_title,
        presenter: e.section_presenter,
        description: e.section_description,
        picture_url: e.section_picture_url,
        start_at: e.section_start_at
      }

      (acc[e.code_name][e.hash].sections ++ [section_entry])
      |> (&put_in(acc, [e.code_name, e.hash, :sections], &1)).()
    end)
  end

  @spec radio_code_names_cached_or_not_for_day(list(), String.t()) :: tuple()
  defp radio_code_names_cached_or_not_for_day(radio_code_names, day) do
    {:ok, cache_keys} = Cachex.keys(:progradio_cache)

    code_names_cached =
      radio_code_names
      |> Enum.filter(fn e -> Enum.member?(cache_keys, "#{@cache_prefix_schedule}#{day}_#{e}") end)

    {code_names_cached, radio_code_names -- code_names_cached}
  end

  @spec radio_code_names_of_collection(String.t()) :: list()
  defp radio_code_names_of_collection(collection_code_name) do
    cache_key_collection = "#{@cache_prefix_collection}#{collection_code_name}"

    {_, code_names} =
      Cachex.fetch(
        :progradio_cache,
        cache_key_collection,
        fn _key ->
          query =
            from r in Radio,
                 join: c in Collection,
                 on: r.collection_id == c.id,
                 where: r.active == true,
                 where: c.code_name == ^collection_code_name,
                 select: r.code_name

          collection_code_names = Repo.all(query)

          {:commit, collection_code_names}
        end
      )

    Utils.set_ttl_if_none(cache_key_collection, @cache_ttl_collection)
    code_names
  end
end
