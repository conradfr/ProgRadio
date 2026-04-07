defmodule ProgRadioApi.Importer.StreamsImporter.Lautfm do
  require Logger
  import Ecto.Query, only: [from: 2]
  alias Ecto.Multi
  alias ProgRadioApi.Repo
  alias ProgRadioApi.{Stream, StreamOverloading}
  alias ProgRadioApi.Streams
  alias ProgRadioApi.Importer.ImageImporter
  alias ProgRadioApi.Utils.ImporterUtils

  @base_url "https://api.laut.fm"
  @page_size 250
  @source "lautfm"

  def import() do
    Logger.info("Lautfm import")

    {result, _} =
      get_radios()
      |> format()
      |> ImporterUtils.import_images()
      |> store()

    Logger.info("Lautfm import: #{result}")

    :ok
  end

  # Data

  defp get_radios() do
    try do
      fetch_all_pages(0, [])
      |> Enum.uniq_by(fn s -> Map.get(s, "name") end)
    rescue
      _ ->
        Logger.warning("Lautfm import: error importing radios")
        []
    catch
      _ ->
        Logger.warning("Lautfm import: error importing radios")
        []
    end
  end

  defp fetch_all_pages(offset, acc) do
    url = "#{@base_url}/stations?order=asc&limit=#{@page_size}&offset=#{offset}"

    Logger.info("Lautfm import: fetching offset=#{offset}, limit=#{@page_size}")

    results =
      HTTPoison.get!(
        url,
        [{"User-Agent", "radio-addict.com"}]
      )
      |> Map.get(:body)
      |> Jason.decode!()
      |> Map.get("items", [])

    new_acc = acc ++ results

    if length(results) >= @page_size do
      fetch_all_pages(offset + @page_size, new_acc)
    else
      new_acc
    end
  end

  defp format(data) do
    data
    |> Enum.map(fn stream ->
      id = find_existing_stream(stream) || Ecto.UUID.bingenerate() |> Ecto.UUID.cast!()

      overloading =
        case Repo.get(StreamOverloading, id) do
          nil -> %{}
          overload_data -> overload_data
        end

      img_url = Map.get(stream, "images", %{}) |> Map.get("station")

      country_code =
        "DE"
        |> (&(Map.get(overloading, :country_code) || &1)).()

      website =
        stream
        |> Map.get("page_url")
        |> (&(Map.get(overloading, :website) || &1)).()

      enabled =
        stream
        |> Map.get("active")
        |> (&(Map.get(overloading, :enabled) || &1)).()

      import_updated_at =
        NaiveDateTime.utc_now()
        |> NaiveDateTime.truncate(:second)

      tags =
        Map.get(overloading, :tags) ||
          Map.get(stream, "genres", []) |> Enum.join(",") |> String.downcase()

      %{
        id: id,
        code_name: id,
        name: Map.get(stream, "display_name"),
        img_url: img_url,
        original_img: img_url,
        img: nil,
        website: website,
        stream_url: Map.get(stream, "stream_url"),
        original_stream_url: Map.get(stream, "stream_url"),
        tags: tags,
        original_tags: Map.get(stream, "tags"),
        country_code: country_code,
        language: Map.get(stream, "language"),
        enabled: enabled,
        description: Map.get(stream, "description"),
        import_updated_at: import_updated_at,
        source: @source
      }
    end)
    |> Enum.filter(fn s -> s.name !== nil and String.trim(s.name) !== "" end)
  end

  # Store

  defp store(streams) do
    multi_upsert =
      Multi.new()
      |> upsert_streams(streams)

    Logger.debug("Lautfm import upsert: #{Kernel.length(multi_upsert.operations)}")

    Repo.transaction(multi_upsert, timeout: :infinity)
  end

  @spec upsert_streams(Multi.t(), list()) :: any
  defp upsert_streams(multi, streams) do
    streams
    |> Enum.reduce(multi, fn s, acc_multi ->
      changeset = Stream.changeset(%Stream{}, s)

      Ecto.Multi.insert(acc_multi, s.id, changeset,
        on_conflict: [
          set: [
            name: s.name,
            img: s.img,
            original_img: s.original_img,
            country_code: s.country_code,
            tags: s.tags,
            description: s.description,
            original_tags: s.original_tags,
            website: s.website,
            stream_url: s.stream_url,
            original_stream_url: s.original_stream_url,
            enabled: s.enabled,
            import_updated_at: s.import_updated_at,
            source: s.source
          ]
        ],
        conflict_target: :id
      )
    end)
  end

  defp find_existing_stream(%{} = data) do
    from(s in Stream,
      where: s.stream_url == ^data["stream_url"],
      limit: 1,
      select: s.id
    )
    |> Repo.one()
  end
end
