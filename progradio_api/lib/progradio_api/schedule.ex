defmodule ProgRadioApi.Schedule do
  @moduledoc """
  The Schedules context.
  """

  import Ecto.Query
  alias ProgRadioApi.Repo

  alias ProgRadioApi.Utils
  alias ProgRadioApi.Radio
  alias ProgRadioApi.Collection
  alias ProgRadioApi.ScheduleEntry
  alias ProgRadioApi.SectionEntry

  @timezone "Europe/Paris"

  # two days
  @cache_ttl 172_800

  @cache_prefix "schedule_"

  def list_schedule_collection(day, collection) when is_binary(collection) do
    cache_key = "#{@cache_prefix}#{day}_#{collection}"

    {_, schedule} =
      Cachex.fetch(
        :progradio_cache,
        cache_key,
        fn _key ->
          result =
            day
            |> query()
            |> join(:inner, [se, r, sc], c in Collection, on: r.collection_id == c.id)
            |> where([se, r, sc, c], c.code_name == ^collection)
            |> Repo.all()
            |> format()

          {:commit, result}
        end
      )

    Utils.set_ttl_if_none(cache_key, @cache_ttl)
    schedule
  end

  def list_schedule_radios(day, radios) when is_list(radios) and length(radios) > 0 do
    day
    |> query()
    |> where([se, r, sc, c], r.code_name in ^radios)
    |> Repo.all()
    |> format()
  end

  def list_schedule_radios(day, _radios) do
    list_schedule(day)
  end

  def list_schedule(day) do
    cache_key = @cache_prefix <> day

    {_, schedule} =
      Cachex.fetch(
        :progradio_cache,
        cache_key,
        fn _key ->
          result =
            day
            |> query()
            |> Repo.all()
            |> format()

          {:commit, result}
        end
      )

    Utils.set_ttl_if_none(cache_key, @cache_ttl)
    schedule
  end

  def query(day) do
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

  def format(data) do
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
end
