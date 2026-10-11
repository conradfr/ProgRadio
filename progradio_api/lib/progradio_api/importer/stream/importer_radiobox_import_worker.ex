defmodule ProgRadioApi.ImporterRadioBoxImportWorker do
  use Oban.Worker, queue: :import_stream_radiobox
  import Ecto.Query, warn: false, only: [from: 2]
  require Logger

  alias ProgRadioApi.Repo
  alias ProgRadioApi.Utils.ImporterUtils
  alias ProgRadioApi.{Stream, StreamOverloading}
  alias ProgRadioApi.Importer.Tools.Images

  @source_name "radiobox"
  @sleep_ms 500

  @impl Oban.Worker
  def perform(%Oban.Job{args: args}) do
    Logger.debug("Stream import job: RadioBox")

    # this is a quick hack to respect the source
    # and not make too much requests
    :timer.sleep(@sleep_ms)

    try do
      url = Map.get(args, "url", "")

      page =
        url
        |> Req.get!()
        |> Map.get(:body)
        |> Floki.parse_document!()

      [country_code, external_id] =
        url
        |> URI.parse()
        |> Map.get(:path)
        |> String.split("/", trim: true)

      name =
        page
        |> Floki.find("h1.station__title")
        |> List.first()
        |> Floki.text()
        |> String.trim()

      stream_url =
        page
        |> Floki.find(".station_play")
        |> List.first()
        |> Floki.attribute("stream")
        |> List.first()
        |> String.trim()

      # the stream as already imported from radiobox, it is then updated
      existing_stream = find_existing_stream(external_id) || %{}

      # a stream not imported yet is left out when another one has its url or its name
      if existing_stream != %{} or find_duplicate_stream(stream_url, name, country_code) == nil do
        id = Map.get(existing_stream, :id) || Ecto.UUID.bingenerate() |> Ecto.UUID.cast!()

        overloading =
          case Repo.get(StreamOverloading, id) do
            nil -> %{}
            overload_data -> overload_data
          end

        import_updated_at =
          NaiveDateTime.utc_now()
          |> NaiveDateTime.truncate(:second)

        original_stream_url = stream_url

        stream_url =
          stream_url
          |> ImporterUtils.replace_value_maybe(@source_name, existing_stream, :stream_url)
          |> (&(Map.get(overloading, :stream_url) || &1)).()

        name =
          name
          |> ImporterUtils.replace_value_maybe(@source_name, existing_stream, :name)
          |> (&(Map.get(overloading, :name) || &1)).()

        country_code =
          country_code
          |> String.upcase()
          |> ImporterUtils.replace_value_maybe(@source_name, existing_stream, :country_code)
          |> (&(Map.get(overloading, :country_code) || &1)).()

        website =
          with [elem | _] <- Floki.find(page, ".station__reference--web"),
               [href | _] <- Floki.attribute(elem, "href") do
            String.trim(href)
          else
            _ -> nil
          end
          |> ImporterUtils.replace_value_maybe(@source_name, existing_stream, :website)
          |> (&(Map.get(overloading, :website) || &1)).()

        description =
          with [elem | _] <- Floki.find(page, ".station__description") do
            elem |> Floki.text() |> String.trim()
          else
            _ -> nil
          end
          |> ImporterUtils.replace_value_maybe(@source_name, existing_stream, :description)
          |> (&(Map.get(overloading, :description) || &1)).()

        original_img =
          with [elem | _] <- Floki.find(page, ".station__logo img"),
               [src | _] <- Floki.attribute(elem, "src") do
            String.trim(src)
          else
            _ -> nil
          end
          |> ImporterUtils.replace_value_maybe(@source_name, existing_stream, :original_img)

        img_url = Map.get(overloading, :img) || original_img

        original_tags =
          page
          |> Floki.find("ul.station__tags li")
          |> Floki.text(sep: ",")

        tags = Map.get(overloading, :tags) || original_tags

        language =
          with [_ | _] = elems <- Floki.find(page, ".station__reference__lang") do
            Floki.text(elems, sep: ",")
          else
            _ -> nil
          end
          |> ImporterUtils.replace_value_maybe(@source_name, existing_stream, :language)

        # radiobox has no slogan, the one of the stream is kept
        slogan = Map.get(overloading, :slogan) || Map.get(existing_stream, :slogan)

        # the import does not enable again a stream that was disabled
        enabled =
          case Map.get(overloading, :enabled) do
            nil -> Map.get(existing_stream, :enabled, true)
            value -> value
          end

        stream =
          %{
            id: id,
            code_name: id,
            external_id: external_id,
            source: @source_name,
            name: name,
            img_url: img_url,
            original_img: original_img,
            # kept when the image can't be imported again
            img: Map.get(existing_stream, :img),
            website: website,
            stream_url: stream_url,
            original_stream_url: original_stream_url,
            tags: tags,
            original_tags: original_tags,
            country_code: country_code,
            slogan: slogan,
            description: description,
            language: language,
            enabled: enabled,
            redirect_to: Map.get(existing_stream, :redirect_to),
            import_updated_at: import_updated_at
          }

        stream =
          [stream]
          |> Images.import_images()
          |> List.first()

        Logger.info("Stream import job: RadioBox: #{stream.name}")

        {:ok, _saved_stream} =
          %Stream{}
          |> Stream.changeset(stream)
          |> Repo.insert(
            on_conflict: [
              set: [
                name: stream.name,
                img: stream.img,
                original_img: stream.original_img,
                country_code: stream.country_code,
                tags: stream.tags,
                original_tags: stream.original_tags,
                website: stream.website,
                language: stream.language,
                slogan: stream.slogan,
                description: stream.description,
                stream_url: stream.stream_url,
                source: stream.source,
                external_id: stream.external_id,
                original_stream_url: stream.original_stream_url,
                enabled: stream.enabled,
                import_updated_at: stream.import_updated_at
              ]
            ],
            conflict_target: :id
          )
      else
        Logger.info("Stream import job: RadioBox: stream already in database (#{url})")
      end
    rescue
      _e ->
        Logger.error("Stream import job: RadioBox - rescue (#{Map.get(args, "url", "")})")
    end

    :ok
  end

  def import_all() do
    base = "https://onlineradiobox.com"
    Logger.info("Stream import: RadioBox - starting full import")

    continent_urls =
      base
      |> Req.get!()
      |> Map.get(:body)
      |> Floki.parse_document!()
      |> Floki.find("ul.catalog__mainland-list li a[href]")
      |> Enum.flat_map(&Floki.attribute(&1, "href"))
      |> Enum.map(fn href ->
        uri = URI.parse(href)
        if uri.host, do: href, else: base <> href
      end)

    country_codes =
      continent_urls
      |> Enum.flat_map(fn url ->
        url
        |> Req.get!()
        |> Map.get(:body)
        |> Floki.parse_document!()
        |> Floki.find("ul.countries__countries-list li a[href]")
        |> Enum.flat_map(&Floki.attribute(&1, "href"))
        |> Enum.flat_map(fn href ->
          case String.split(URI.parse(href).path || "", "/", trim: true) do
            [code] -> [code]
            _ -> []
          end
        end)
      end)
      |> Enum.uniq()

    Logger.info("Stream import: RadioBox - #{length(country_codes)} country/countries found")

    Enum.each(country_codes, &import_from_country/1)

    :ok
  end

  def import_from_country(country_code) when is_binary(country_code) do
    base_url = "https://onlineradiobox.com/#{country_code}/"
    Logger.info("Stream import: RadioBox - crawling country #{country_code}")

    first_page =
      base_url
      |> Req.get!()
      |> Map.get(:body)
      |> Floki.parse_document!()

    max_page =
      first_page
      |> Floki.find("a[href*=\"?p=\"]")
      |> Enum.flat_map(&Floki.attribute(&1, "href"))
      |> Enum.flat_map(fn href ->
        case Regex.run(~r/\?p=(\d+)/, href) do
          [_, n] -> [String.to_integer(n)]
          _ -> []
        end
      end)
      |> Enum.max(fn -> 0 end)

    Logger.info("Stream import: RadioBox - #{country_code}: #{max_page + 1} page(s) to crawl")

    all_station_urls =
      [first_page | fetch_listing_pages(base_url, max_page)]
      |> Enum.flat_map(&extract_station_urls(&1, country_code))
      |> Enum.uniq()

    Logger.info(
      "Stream import: RadioBox - #{country_code}: enqueueing #{length(all_station_urls)} station(s)"
    )

    Enum.each(all_station_urls, fn url ->
      %{"url" => url}
      |> __MODULE__.new()
      |> Oban.insert()
    end)

    :ok
  end

  defp fetch_listing_pages(_base_url, 0), do: []

  defp fetch_listing_pages(base_url, max_page) do
    Enum.map(1..max_page, fn p ->
      :timer.sleep(1000)

      "#{base_url}?p=#{p}"
      |> Req.get!()
      |> Map.get(:body)
      |> Floki.parse_document!()
    end)
  end

  defp extract_station_urls(page, country_code) do
    base = "https://onlineradiobox.com"

    page
    |> Floki.find("a[href]")
    |> Enum.flat_map(&Floki.attribute(&1, "href"))
    |> Enum.filter(fn href ->
      path = URI.parse(href).path || ""

      case String.split(path, "/", trim: true) do
        [^country_code, _slug] -> true
        _ -> false
      end
    end)
    |> Enum.map(fn href ->
      uri = URI.parse(href)
      if uri.host, do: href, else: base <> href
    end)
  end

  defp find_existing_stream(external_id) do
    from(s in Stream,
      where: s.external_id == ^external_id and s.source == @source_name,
      limit: 1
    )
    |> Repo.one()
  end

  # another stream of the country with the same url or the same name
  defp find_duplicate_stream(stream_url, name, country_code) do
    from(s in Stream,
      # there is an index for lower(name)
      where:
        (s.stream_url == ^stream_url and s.country_code == ^String.upcase(country_code)) or
          (fragment("lower(?) = ?", s.name, ^String.downcase(name)) and
             s.country_code == ^String.upcase(country_code)),
      limit: 1,
      select: s.id
    )
    |> Repo.one()
  end
end
