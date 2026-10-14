defmodule ProgRadioApi.ImporterStreemaImportWorker do
  use Oban.Worker, queue: :import_stream_streema
  require Logger

  alias ProgRadioApi.Repo
  alias ProgRadioApi.{Stream, StreamOverloading}
  alias ProgRadioApi.Utils.ImporterUtils
  alias ProgRadioApi.Importer.Tools.Images
  alias ProgRadioApi.Importer.Classifiers.TagsClassifier
  alias ProgRadioApi.Importer.Classifiers.GenresNormalizer
  alias ProgRadioApi.Importer.Deduper

  @source "streema"
  @sleep_ms 500
  @base_url "https://fr.streema.com/api/radios/"

  # the countries streema gives without a country code, by their name
  @country_codes %{
    "Russia" => "RU",
    "Macedonia" => "MK",
    "Iran" => "IR",
    "Democratic Republic of the Congo" => "CD",
    "Kosovo" => "XK",
    "Virgin Islands (US)" => "VI",
    "Ivory Coast" => "CI",
    "Palestine" => "PS",
    "Vatican" => "VA",
    "Syria" => "SY",
    "Cape Verde" => "CV",
    "Gambia (The)" => "GM",
    "Sint Maarten" => "SX",
    "Brunei" => "BN",
    "Swaziland" => "SZ",
    "Faroe Islands, Denmark" => "FO",
    "Micronesia" => "FM",
    "São Tomé and Príncipe" => "ST",
    "Laos" => "LA",
    "East Timor" => "TL",
    "Falkland Islands" => "FK",
    "Guernsey, United Kingdom" => "GG"
  }

  # "Lesser Antilles, France", "French West Indies" and "Netherlands Antilles" are several
  # territories, the state or the city tells which one
  @territory_codes %{
    "Martinique" => "MQ",
    "Guadeloupe" => "GP",
    "Saint Martin" => "MF",
    "Bonaire" => "BQ"
  }

  @impl Oban.Worker
  def perform(%Oban.Job{args: args}) do
    Logger.debug("Stream import job: Streema")

    slug = Map.get(args, "slug", "")

    try do
      api_data =
        (@base_url <> URI.encode(slug))
        |> Req.get!()
        |> Map.get(:body)

      stream_url = decode_stream_url(api_data)

      cond do
        # nothing to listen to (or the radio was not found), the stream is not imported
        stream_url in [nil, ""] ->
          Logger.debug("Stream import job: Streema - no stream url, skipped (#{slug})")

        # streema sometimes gives the website of the radio as its stream
        website?(stream_url, Map.get(api_data, "website")) ->
          Logger.debug(
            "Stream import job: Streema - the stream url is the website, skipped (#{slug})"
          )

        true ->
          api_data = Map.put(api_data, "country_code", country_code(api_data))

          # this is a quick hack to respect the source
          # and not make too much requests
          :timer.sleep(@sleep_ms)

          # Returns `{:same, stream}`, `{:duplicate, stream}` or `nil`.
          existing =
            %{
              external_id: api_data |> Map.get("id") |> Integer.to_string(),
              source: @source,
              name: Map.get(api_data, "name"),
              # as it will be stored, and as given by streema
              stream_url: ImporterUtils.stream_url_transformer(stream_url),
              original_stream_url: stream_url,
              country_code: Map.get(api_data, "country_code"),
              website: Map.get(api_data, "website"),
              frequency: Map.get(api_data, "dial"),
              band: Map.get(api_data, "band")
            }
            |> Deduper.find_existing_stream()

          stream =
            existing
            |> format(api_data, stream_url)
            |> Images.import_image()

          {:ok, _saved_stream} = store(stream)
      end
    rescue
      e ->
        Logger.error("Stream import job: Streema - rescue (#{slug}): #{Exception.message(e)}")
    end

    :ok
  end

  defp decode_stream_url(%{"encoded_stream_url" => encoded})
       when is_binary(encoded) and encoded != "" do
    encoded
    |> Base.decode64!(padding: false)
    |> :zlib.uncompress()
  end

  defp decode_stream_url(_api_data), do: nil

  # the same url, whatever the protocol, the "www." and the trailing "/"
  defp website?(stream_url, website) when is_binary(website) do
    normalize = fn url ->
      url
      |> String.trim()
      |> String.downcase()
      |> String.replace(~r{^https?://(www\.)?}, "")
      |> String.trim_trailing("/")
    end

    normalize.(stream_url) == normalize.(website)
  end

  defp website?(_stream_url, _website), do: false

  # nil when there is no country ("Web") or when it is not known
  defp country_code(%{"country_code" => country_code})
       when is_binary(country_code) and country_code != "",
       do: country_code

  defp country_code(api_data) do
    Map.get(@country_codes, Map.get(api_data, "country_name")) ||
      Map.get(@territory_codes, Map.get(api_data, "state_name")) ||
      Map.get(@territory_codes, Map.get(api_data, "city_name"))
  end

  # Format

  # the stream was already imported from streema, it is updated
  defp format({:same, existing_stream}, stream, decoded_stream_url) do
    overloading =
      case Repo.get(StreamOverloading, existing_stream.id) do
        nil -> %{}
        overload_data -> overload_data
      end

    name =
      stream
      |> Map.get("name")
      |> ImporterUtils.replace_value_maybe(@source, existing_stream, :name)
      |> (&(Map.get(overloading, :name) || &1)).()

    original_img =
      stream
      |> Map.get("logo_url")
      |> ImporterUtils.replace_value_maybe(@source, existing_stream, :original_img)

    img_url = Map.get(overloading, :img) || original_img

    country_code =
      stream
      |> Map.get("country_code")
      |> ImporterUtils.replace_value_maybe(@source, existing_stream, :country_code)
      |> (&(Map.get(overloading, :country_code) || &1)).()

    website =
      stream
      |> Map.get("website")
      |> ImporterUtils.replace_value_maybe(@source, existing_stream, :website)
      |> (&(Map.get(overloading, :website) || &1)).()

    slogan =
      stream
      |> Map.get("slogan")
      |> ImporterUtils.replace_value_maybe(@source, existing_stream, :slogan)
      |> (&(Map.get(overloading, :slogan) || &1)).()

    description =
      stream
      |> Map.get("description")
      |> ImporterUtils.replace_value_maybe(@source, existing_stream, :description)
      |> (&(Map.get(overloading, :description) || &1)).()

    language =
      stream
      |> Map.get("language")
      |> ImporterUtils.replace_value_maybe(@source, existing_stream, :language)

    enabled =
      true
      |> (&(Map.get(overloading, :enabled) || &1)).()

    {genres, tags} = classify_genres(stream)

    tags = Map.get(overloading, :tags) || tags
    genres = Map.get(overloading, :genres) || genres

    stream_url =
      decoded_stream_url
      |> (&(ImporterUtils.replace_value_maybe(&1, @source, existing_stream, :stream_url) || &1)).()
      |> (&(Map.get(overloading, :stream_url) || &1)).()
      |> ImporterUtils.stream_url_transformer()

    %{
      id: existing_stream.id,
      code_name: existing_stream.id,
      external_id: existing_stream.external_id,
      name: name,
      img_url: img_url,
      original_img: original_img,
      img: existing_stream.img,
      website: website,
      slogan: slogan,
      description: description,
      stream_url: stream_url,
      original_stream_url: decoded_stream_url,
      location: Map.get(stream, "location_line"),
      tags: tags,
      genres: genres,
      original_tags: original_tags(stream),
      country_code: country_code,
      language: language,
      enabled: enabled,
      import_updated_at: import_updated_at(),
      redirect_to: existing_stream.redirect_to,
      source: @source
    }
  end

  # the radio already exists from another source: the streema one is stored but redirected to it
  defp format({:duplicate, existing_stream}, stream, decoded_stream_url) do
    format_new(stream, decoded_stream_url, existing_stream.id)
  end

  defp format(nil, stream, decoded_stream_url) do
    format_new(stream, decoded_stream_url, nil)
  end

  defp format_new(stream, decoded_stream_url, redirect_to) do
    id = Ecto.UUID.bingenerate() |> Ecto.UUID.cast!()

    img_url = Map.get(stream, "logo_url")

    {genres, tags} = classify_genres(stream)

    %{
      id: id,
      code_name: id,
      external_id: Map.get(stream, "id") |> Integer.to_string(),
      name: Map.get(stream, "name"),
      img_url: img_url,
      original_img: img_url,
      img: nil,
      website: Map.get(stream, "website"),
      slogan: Map.get(stream, "slogan"),
      description: Map.get(stream, "description"),
      stream_url: ImporterUtils.stream_url_transformer(decoded_stream_url),
      original_stream_url: decoded_stream_url,
      location: Map.get(stream, "location_line"),
      tags: tags,
      genres: genres,
      original_tags: original_tags(stream),
      country_code: Map.get(stream, "country_code"),
      language: Map.get(stream, "language"),
      enabled: true,
      import_updated_at: import_updated_at(),
      redirect_to: redirect_to,
      source: @source
    }
  end

  defp classify_genres(stream) do
    (Map.get(stream, "genres") || [])
    |> Enum.join(",")
    |> String.downcase()
    |> TagsClassifier.classify()
    |> GenresNormalizer.normalize()
  end

  defp original_tags(stream) do
    (Map.get(stream, "genres") || [])
    |> Enum.join(",")
  end

  defp import_updated_at() do
    NaiveDateTime.utc_now()
    |> NaiveDateTime.truncate(:second)
  end

  # Store

  defp store(s) do
    %Stream{}
    |> Stream.changeset(s)
    |> Repo.insert(
      on_conflict: [
        set: [
          name: s.name,
          img: s.img,
          original_img: s.original_img,
          country_code: s.country_code,
          tags: s.tags,
          genres: s.genres,
          description: s.description,
          slogan: s.slogan,
          original_tags: s.original_tags,
          website: s.website,
          language: s.language,
          stream_url: s.stream_url,
          original_stream_url: s.original_stream_url,
          location: s.location,
          enabled: s.enabled,
          import_updated_at: s.import_updated_at,
          source: s.source,
          redirect_to: s.redirect_to,
          external_id: s.external_id
        ]
      ],
      conflict_target: :id
    )
  end
end
