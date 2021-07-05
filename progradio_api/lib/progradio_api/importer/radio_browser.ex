defmodule ProgRadioApi.Importer.StreamsImporter.RadioBrowser do
  import Ecto.Query, only: [from: 2]
  alias Ecto.Multi
  alias ProgRadioApi.Repo
  alias ProgRadioApi.Stream
  alias ProgRadioApi.Importer.ImageImporter
  alias ProgRadioApi.Importer.StreamsImporter.StreamMatcher

  @image_folder "stream"

  @servers_dns "all.api.radio-browser.info"
  @api_all_radios "/stations"

  @max_concurrency 4
  @task_timeout 1000000

  def import() do
    get_one_random_server()
    |> get_radios()
    |> format()
    |> import_images()
    |> delete_images_from_removed_stations()
    |> store()

    StreamMatcher.match()
  end

  # Data

  defp get_radios(host) do
    # ?limit=20&offset=7500
    HTTPoison.get!(
      "https://#{host}/json/#{@api_all_radios}",
      [{"User-Agent", "programmes-radio.com"}]
    )
    |> Map.get(:body)
    |> Jason.decode!()
    |> Enum.uniq_by(fn s -> Map.get(s, "stationuuid") end)
    |> Enum.filter(fn s ->
      Map.get(s, "lastcheckok") !== 0 and Map.get(s, "stationuuid") !== "" and
        Map.get(s, "name") !== "" and
        (Map.get(s, "url_resolved") !== "" or Map.get(s, "url") !== "")
    end)
    # the app can't read hls streams that are not served by https (cross-origin problem)
    |> Enum.reject(fn s ->
      Map.get(s, "url") |> String.downcase() |> String.starts_with?("https") === false and
        Map.get(s, "url") |> String.downcase() |> String.ends_with?(".m3u8") === true
    end)
  end

  @spec data_mapping(struct) :: struct
  defp data_mapping(stream) do
    stream_url =
      case Map.get(stream, "url_resolved") do
        "" -> Map.get(stream, "url")
        value -> value
      end
      # found in some entries, not sure of a better way to remove them
      |> String.trim("\u0000")
      |> String.trim()

    name =
      Map.get(stream, "name")
      |> String.trim("\u0000")
      |> String.trim()

    %{
      id: Map.get(stream, "stationuuid"),
      code_name: Map.get(stream, "stationuuid"),
      name: name,
      img_url: Map.get(stream, "favicon"),
      img: nil,
      website: Map.get(stream, "homepage"),
      stream_url: stream_url,
      tags: Map.get(stream, "tags"),
      country_code: Map.get(stream, "countrycode"),
      language: Map.get(stream, "language"),
      votes: Map.get(stream, "votes"),
      clicks_last_24h: Map.get(stream, "clickcount")
    }
  end

  defp format(data) do
    data
    |> Enum.map(&data_mapping/1)
  end

  # Images

  defp import_images(streams) do
    streams
    |> Task.async_stream(fn s -> import_image(s) end,
      timeout: @task_timeout,
      max_concurrency: @max_concurrency
    )
    |> Enum.reduce([], fn {:ok, s}, acc -> acc ++ [s] end)
  end

  @spec import_image(struct) :: struct
  defp import_image(stream) do
    case stream.img_url do
      url when is_binary(url) and url !== "" ->
        case String.ends_with?(url, ".svg") do
          false ->
            Map.delete(stream, :img_url)

            try do
              with {:ok, filename} <- ImageImporter.import_stream(url, stream) do
                Map.put(stream, :img, filename)
              else
                _ -> stream
              end
            rescue
              _ -> stream
            catch
              _ -> stream
              :exit, _ -> stream
            end

          true ->
            stream
        end

      _ ->
        stream
    end
  end

  defp delete_images_from_removed_stations(streams) do
    ids_to_keep =
      Enum.map(streams, fn s ->
        {:ok, uuid} = Ecto.UUID.dump(s.id)
        uuid
      end)

    query =
      from(
        s in "stream",
        where: s.id not in ^ids_to_keep,
        select: s.img
      )

    img_to_del = Repo.all(query)

    Enum.each(img_to_del, fn img ->
      "#{Application.get_env(:progradio_api, :image_path)}#{@image_folder}/#{img}"
      |> File.rm()
    end)

    {ids_to_keep, streams}
  end

  # Store

  defp store({ids_to_keep, streams} = _args) do
    multi_delete =
      Multi.new()
      |> delete_streams(ids_to_keep)

    multi_upsert =
      Multi.new()
      |> upsert_streams(streams)

    multi_combine = Ecto.Multi.append(multi_delete, multi_upsert)
    Repo.transaction(multi_combine, timeout: :infinity)
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
            country_code: s.country_code,
            tags: s.tags,
            website: s.website,
            language: s.language,
            stream_url: s.stream_url,
            votes: s.votes,
            clicks_last_24h: s.clicks_last_24h
          ]
        ],
        conflict_target: :id
      )
    end)
  end

  @spec delete_streams(Multi.t(), list()) :: any
  defp delete_streams(multi, to_not_delete) do
    q =
      from(
        s in "stream",
        where: s.id not in ^to_not_delete
      )

    Multi.delete_all(multi, :delete, q, [])
  end

  # API

  defp get_one_random_server() do
    get_servers()
    |> Enum.random()
    |> Map.get(:data)
    |> :inet.gethostbyaddr()
    |> Kernel.elem(1)
    |> Kernel.elem(1)
  end

  # DNS lookup
  defp get_servers() do
    DNS.query(@servers_dns)
    |> Map.get(:anlist)
  end
end
