defmodule Importer.Processor.Builder do
  use Timex
  alias Importer.ImageImporter

  # Build

  @spec build(list(map)) :: list(map)
  def build(items)

  def build([]) do
    []
  end

  def build(items, radio) do
    items
    |> cast_schedule()
    |> sort()
    |> build_schedule_end()
    |> build_picture(radio)
  end

  # Casting shows datetimes

  @spec cast_schedule(list(map), list) :: list | fun
  defp cast_schedule(items, acc \\ [])

  defp cast_schedule([], acc) do
    acc
  end

  defp cast_schedule(items, acc) do
    [head | tail] = items

    {:ok, date_time_start, _} = DateTime.from_iso8601(head["date_time_start"])
    updated = %{head | "date_time_start" => date_time_start}

    updated =
      case head["date_time_end"] do
        nil ->
          updated

        _ ->
          {:ok, date_time_end, _} = DateTime.from_iso8601(head["date_time_end"])
          %{updated | "date_time_end" => date_time_end}
      end

    updated =
      with sections when not (sections === nil) <- cast_sections(head["sections"]) do
        %{updated | "sections" => sections}
      else
        _ -> updated
      end

    acc = acc ++ [updated]
    cast_schedule(tail, acc)
  end

  # Cast sections datetimes

  @spec cast_sections(list(map), list) :: list | fun | nil
  defp cast_sections(items, acc \\ [])

  defp cast_sections(nil, _acc) do
    nil
  end

  defp cast_sections([], acc) do
    acc
  end

  defp cast_sections(items, acc) do
    [head | tail] = items

    {:ok, section_start, _} = DateTime.from_iso8601(head["date_time_start"])
    updated = %{head | "date_time_start" => section_start}

    acc = acc ++ [updated]
    cast_sections(tail, acc)
  end

  # Filling schedule_end

  @spec build_schedule_end(list(map), list) :: list | fun
  defp build_schedule_end(items, acc \\ [])

  defp build_schedule_end(items, acc) when length(items) === 1 do
    [head | _tail] = items

    # If last item with not end datetime, set 23:00 in UTC
    # TODO: improve
    item =
      case head["date_time_end"] do
        nil ->
          head["date_time_start"]
          |> Timex.Timezone.convert("Europe/Paris")
          |> Timex.shift(days: 1)
          |> Timex.beginning_of_day()
          |> Timex.Timezone.convert("UTC")
          |> (&Map.put(head, "date_time_end", &1)).()

        _ ->
          head
      end

    acc ++ [item]
  end

  defp build_schedule_end(items, acc) do
    [head | tail] = items

    item =
      case head["date_time_end"] do
        nil ->
          List.first(tail)["date_time_start"]
          |> (&Map.put(head, "date_time_end", &1)).()

        _ ->
          head
      end

    acc = acc ++ [item]
    build_schedule_end(tail, acc)
  end

  # Importing image

  @spec build_picture(list(map), struct, list) :: list | fun
  defp build_picture(items, radio, acc \\ [])

  defp build_picture(items, _radio, acc) when items == [] or items == nil do
    acc
  end

  defp build_picture(items, radio, acc) do
    [head | tail] = items

    item =
      case head["img"] do
        url when is_binary(url) and url !== "" ->
          try do
            with {:ok, imported} <- ImageImporter.import(url, radio)
              do
                imported
                |> (&Map.put(head, "picture_url", &1)).()
                |> Map.delete("img")
              else
              _ -> head
            end
          rescue
            _ -> head
          catch
            _ -> head
            :exit, _ -> head
          end

        _ ->
          head
      end

    # sections pictures
    item =
      case item["sections"] do
        sections when sections != nil ->
          updated = build_picture(item["sections"], radio)
          %{item | "sections" => updated}

        _ ->
          item
      end

    acc = acc ++ [item]
    build_picture(tail, radio, acc)
  end

  # Sort by start time

  @spec sort(list(map)) :: list(map)
  defp sort(items)

  defp sort([]) do
    []
  end

  defp sort(items) do
    Enum.sort(items, fn item1, item2 ->
      :gt === DateTime.compare(item2["date_time_start"], item1["date_time_start"])
    end)
  end
end
