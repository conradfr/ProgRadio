defmodule Importer.Processor do
  require Logger
  import Ecto.Query, only: [from: 2]
  alias Ecto.Multi
  alias Importer.{Radio, ScheduleEntry, SectionEntry}
  use Timex

  @date_format "{0D}-{0M}-{YYYY}"

  def process(key) do
    payload_raw = Redix.command!(:redix, ["GET", key])
    {:ok, date, radio} = process_payload(payload_raw)

    Importer.ProcessorMonitor.processed_entry(key, date, radio)
    :ok
  end

  # If it was a stalled entry in queue, do nothing and let it get being cleaned off
  defp process_payload(payload_raw) when payload_raw === nil do
    {:ok, nil, nil}
  end

  defp process_payload(payload_raw) do
    payload =
      Poison.decode!(payload_raw, as: %Importer.Struct.Payload{items: [%Importer.Struct.Show{sections: [%Importer.Struct.Section{}]}]})

    radio =
      Radio
      |> Importer.Repo.get_by(code_name: payload.radio)

    if radio === nil, do: raise("Radio not found")

    date =
      Timex.parse!(payload.date, @date_format)
      |> Timex.to_date()

    shows =
      Enum.map(payload.items, &cast_schedule/1)
      |> Enum.sort(fn item1, item2 ->
        :gt === DateTime.compare(item2.schedule_start, item1.schedule_start)
      end)
      |> build_schedule_end()
      |> Enum.map(&build_schedule(&1, radio))

    commit(shows, radio.id, date)
    {:ok, date, radio.code_name}
  end

  defp cast_schedule(item) do
    {:ok, schedule_start, _} = DateTime.from_iso8601(item.schedule_start)
    updated = %{item | schedule_start: schedule_start}

    case item.schedule_end do
      nil ->
        updated

      _ ->
        {:ok, schedule_end, _} = DateTime.from_iso8601(item.schedule_end)
        %{updated | schedule_end: schedule_end}
    end
  end

  defp cast_section(item) do
    {:ok, section_start, _} = DateTime.from_iso8601(item.datetime_start)
    %{item | datetime_start: section_start}
  end

  # Filling schedule_end

  defp build_schedule_end(items, acc \\ [])

  defp build_schedule_end(items, acc) when length(items) === 1 do
    [head | _tail] = items

    # If last item with not end datetime, set at midnight next day
    item =
      case head.schedule_end do
        nil ->
          end_date =
            head.schedule_start
            |> Timex.shift(days: 1)
            |> Timex.set(hour: 0, minute: 0, second: 0)

          %{head | schedule_end: end_date}

        _ ->
          head
      end

    acc ++ [item]
  end

  defp build_schedule_end(items, acc) do
    [head | tail] = items

    item =
      case head.schedule_end do
        nil ->
          List.first(tail).schedule_start
          |> (&Map.put(head, :schedule_end, &1)).()

        _ ->
          head
      end

    acc = acc ++ [item]
    build_schedule_end(tail, acc)
  end

  defp build_schedule(item, radio) do
    schedule = %ScheduleEntry{
      date_time_start: item.schedule_start,
      date_time_end: item.schedule_end,
      title: item.title,
      host: item.host,
      description: item.description
    }

    schedule =
      with sections when not(sections === nil) <- Map.get(item, :sections) do
          Enum.map(item.sections, &cast_section/1)
          |> Enum.sort(fn item1, item2 ->
            :gt === DateTime.compare(item2.datetime_start, item1.datetime_start)
          end)
          |> Enum.map(&build_section(&1, schedule, radio))
          |> (&Map.put(schedule, :section_entries, &1)).()
      else
        _ -> schedule
      end

    # Image import
    schedule =
      case item.img do
        url when is_binary(url) ->
          try do
            Importer.ImageImporter.import(item.img, radio)
            |> (&Map.put(schedule, :picture_url, &1)).()
          rescue
            _ -> schedule
          catch
            _ -> schedule
            :exit, _ -> schedule
          end

        _ ->
          schedule
      end

    Ecto.build_assoc(radio, :schedule_entry, schedule)
  end

  defp build_section(item, schedule, radio) do
    section = %SectionEntry{
      date_time_start: item.datetime_start,
      title: item.title,
      presenter: item.presenter,
      description: item.description,
    }

    # Image import
    section =
      case item.img do
        url when is_binary(url) ->
          try do
            Importer.ImageImporter.import(item.img, radio)
            |> (&Map.put(section, :picture_url, &1)).()
          rescue
            _ -> section
          catch
            _ -> section
            :exit, _ -> section
          end

        _ ->
          section
      end

    Ecto.build_assoc(schedule, :section_entries, section)
  end

  # Database

  defp commit(shows, radio_id, date) do
    # will need to be improved if the app spans multiple countries/timezone in the future
    # delete all shows of a radio/day, associated sections deletion is automatically cascaded by the db
    q =
      from(
        se in "schedule_entry",
        where:
          se.radio_id == type(^radio_id, :integer) and
            fragment("DATE(? at time zone 'UTC' at time zone 'Europe/Paris')", se.date_time_start) ==
              ^date
      )

    multi =
      Multi.new()
      |> Multi.delete_all(:delete, q, [])
      |> insert_shows(shows)

    Importer.Repo.transaction(multi)
  end

  defp insert_shows(multi, shows) do
    Enum.reduce(shows, multi, fn show, acc ->
      Ecto.Multi.insert(acc, :rand.uniform(1_000_000), show)
    end)
  end
end
