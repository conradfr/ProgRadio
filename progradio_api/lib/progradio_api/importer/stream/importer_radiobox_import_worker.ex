defmodule ProgRadioApi.ImporterRadioBoxImportWorker do
  use Oban.Worker, queue: :import_stream_radiobox
  import Ecto.Query, warn: false, only: [from: 2]
  require Logger

  alias ProgRadioApi.Repo
  alias ProgRadioApi.Utils.ImporterUtils
  alias ProgRadioApi.Stream

  @source_name "radiobox"
  @sleep_ms 5000

  @impl Oban.Worker
  def perform(%Oban.Job{args: args}) do
    Logger.debug("Stream import job: RadioBox")

    # this is a quick hack to respect the source
    # and not make too much requests
    :timer.sleep(@sleep_ms);

    # todo manage overloading

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

      if find_existing_stream(external_id, stream_url, name, country_code) == nil do
        import_updated_at =
          NaiveDateTime.utc_now()
          |> NaiveDateTime.truncate(:second)

        website =
          with [elem | _] <- Floki.find(page, ".station__reference--web"),
               [href | _] <- Floki.attribute(elem, "href") do
            String.trim(href)
          else
            _ -> nil
          end

        description =
          with [elem | _] <- Floki.find(page, ".station__description") do
            elem |> Floki.text() |> String.trim()
          else
            _ -> nil
          end

        img_url =
          with [elem | _] <- Floki.find(page, ".station__logo img"),
               [src | _] <- Floki.attribute(elem, "src") do
            String.trim(src)
          else
            _ -> nil
          end

        tags =
          page
          |> Floki.find("ul.station__tags li")
          |> Floki.text(sep: ",")

        language =
          with [_ | _] = elems <- Floki.find(page, ".station__reference__lang") do
            Floki.text(elems, sep: ",")
          else
            _ -> nil
          end

        id = Ecto.UUID.bingenerate() |> Ecto.UUID.cast!()

        stream =
          %{
            id: id,
            code_name: id,
            external_id: external_id,
            source: @source_name,
            name: name,
            img_url: img_url,
            original_img: img_url,
            img: nil,
            website: website,
            stream_url: stream_url,
            original_stream_url: stream_url,
            tags: tags,
            original_tags: tags,
            country_code: String.upcase(country_code),
            slogan: nil,
            description: description,
            language: language,
            enabled: true,
            redirect_to: nil,
            import_updated_at: import_updated_at
          }

        stream =
          [stream]
          |> ImporterUtils.import_images()
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
      e ->
        Logger.error("Stream import job: RadioBox - rescue (#{Map.get(args, "url", "")})")
#        IO.puts("#{inspect e}")
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

    Logger.info("Stream import: RadioBox - #{country_code}: enqueueing #{length(all_station_urls)} station(s)")

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
      :timer.sleep(1000);
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

  defp find_existing_stream(external_id, stream_url, name, country_code) do
    from(s in Stream,
      where: (s.external_id == ^external_id and s.source == @source_name)
        or (s.stream_url == ^stream_url and s.country_code == ^String.upcase(country_code))
        # there is an index for lower(name)
        or (fragment("lower(?) = ?", s.name, ^String.downcase(name)) and s.country_code == ^String.upcase(country_code)),
      limit: 1,
      select: s.id
    )
    |> Repo.one()
  end
end
