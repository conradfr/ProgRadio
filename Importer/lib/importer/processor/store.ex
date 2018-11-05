defmodule Importer.Processor.Store do
  import Ecto.Query, only: [from: 2]
  alias Ecto.Multi
  alias Importer.{ScheduleEntry, SectionEntry}
  alias Importer.Repo

  @spec persist(list(map), struct, Date.t()) :: any
  def persist(shows, radio, date) do
    {multi, to_not_delete} =
      Multi.new()
      |> (&build_multi(shows, radio, &1, [])).()

    multi_delete =
      Multi.new()
      |> delete_schedule(to_not_delete, radio, date)

    multi_combine = Ecto.Multi.append(multi_delete, multi)
    Importer.Repo.transaction(multi_combine)
  end

  @spec delete_schedule(Multi.t(), list(integer), struct, Date.t()) :: any
  defp delete_schedule(multi, to_not_delete, radio, date) do
    q =
      from(
        se in "schedule_entry",
        where:
          se.radio_id == type(^radio.id, :integer) and
            fragment("DATE(? at time zone 'UTC' at time zone 'Europe/Paris')", se.date_time_start) ==
              ^date and se.id not in ^to_not_delete
      )

    Multi.delete_all(multi, :delete, q, [])
  end

  # Build multi

  @spec build_multi(list(map), struct, Multi, list(integer)) :: {Multi, list(integer)} | fun
  defp build_multi(shows, radio, multi, to_not_delete)

  defp build_multi([], _radio, multi, to_not_delete) do
    {multi, to_not_delete}
  end

  defp build_multi(shows, radio, multi, to_not_delete) do
    [head | tail] = shows

    # In case two schedules have the same radio_id & date_time_start get_by() will raise
    # and we can't update them reliably, so we put no id they'll be be deleted & reinserted
    {multi, to_not_delete} =
      try do
        case ScheduleEntry
             |> Repo.get_by(%{radio_id: radio.id, date_time_start: head["date_time_start"]}) do
          nil ->
            changeset =
              Ecto.build_assoc(radio, :schedule_entry, %ScheduleEntry{})
              |> ScheduleEntry.create_changeset(head)

            {Ecto.Multi.insert(multi, :rand.uniform(1_000_000), changeset), to_not_delete}

          schedule ->
            head_updated =
              get_sections_ids(head["sections"], schedule.id)
              |> (&Map.put(head, "sections", &1)).()

            changeset = ScheduleEntry.update_changeset(schedule, head_updated)

            {Ecto.Multi.update(multi, :rand.uniform(1_000_000), changeset),
             [schedule.id | to_not_delete]}
        end
      rescue
        _ ->
          changeset =
            Ecto.build_assoc(radio, :schedule_entry, %ScheduleEntry{})
            |> ScheduleEntry.create_changeset(head)

          {Ecto.Multi.insert(multi, :rand.uniform(1_000_000), changeset), to_not_delete}
      else
        entry -> entry
      end

    build_multi(tail, radio, multi, to_not_delete)
  end

  # Sections id

  @spec get_sections_ids(list(map), integer, list(map)) :: list(map) | fun
  defp get_sections_ids(sections, schedule_id, acc \\ [])

  defp get_sections_ids(sections, _schedule_id, acc) when sections == [] or sections == nil do
    acc
  end

  defp get_sections_ids(sections, schedule_id, acc) do
    [head | tail] = sections

    # In case two sections have the same schedule_id & date_time_start get_by() will raise
    # and we can't update them reliably, so we put no id they'll be be deleted & reinserted
    section =
      try do
        case SectionEntry
             |> Repo.get_by(%{
               schedule_entry_id: schedule_id,
               date_time_start: head["date_time_start"]
             }) do
          nil -> head
          section_entry -> Map.put(head, "id", section_entry.id)
        end
      rescue
        _ -> head
      else
        entry -> entry
      end

    acc = acc ++ [section]
    get_sections_ids(tail, schedule_id, acc)
  end
end
