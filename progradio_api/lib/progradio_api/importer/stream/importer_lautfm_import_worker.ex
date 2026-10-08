defmodule ProgRadioApi.ImporterLautfmImportWorker do
  use Oban.Worker, queue: :import_stream_lautfm
  import Ecto.Query, warn: false, only: [from: 2]
  require Logger

  alias ProgRadioApi.Repo
  alias ProgRadioApi.{Stream, StreamOverloading}
  alias ProgRadioApi.Utils.ImporterUtils
  alias ProgRadioApi.Importer.Classifiers.TagsClassifier

  @source "lautfm"

  @impl Oban.Worker
  def perform(%Oban.Job{args: args}) do
    Logger.debug("Stream import job: Lautfm")

    try do
      stream = format(args)

      if stream.name !== nil and String.trim(stream.name) !== "" do
        stream =
          [stream]
          |> ImporterUtils.import_images()
          |> List.first()

        Logger.debug("Stream import job: Lautfm: #{stream.name}")

        {:ok, _saved_stream} = store(stream)
      end
    rescue
      _ ->
        Logger.error("Stream import job: Lautfm - rescue")
    end

    :ok
  end

  defp format(stream) do
    existing_stream = find_existing_stream(stream) || %{}
    id = Map.get(existing_stream, :id) || Ecto.UUID.bingenerate() |> Ecto.UUID.cast!()

    overloading =
      case Repo.get(StreamOverloading, id) do
        nil -> %{}
        overload_data -> overload_data
      end

    img_url =
      stream
      |> Map.get("images", %{})
      |> Map.get("station")
      |> ImporterUtils.replace_value_maybe(@source, existing_stream, :original_img)
      |> (&(Map.get(overloading, :img) || &1)).()

    country_code =
      "DE"
      |> (&(Map.get(overloading, :country_code) || &1)).()

    website =
      stream
      |> Map.get("third_parties", %{})
      |> Map.get("website", %{})
      |> Map.get("url", Map.get(stream, "page_url"))
      |> ImporterUtils.replace_value_maybe(@source, existing_stream, :website)
      |> (&(Map.get(overloading, :website) || &1)).()

    enabled =
      stream
      |> Map.get("active")
      |> (&(Map.get(overloading, :enabled) || &1)).()

    name =
      stream
      |> Map.get("display_name")
      |> ImporterUtils.replace_value_maybe(@source, existing_stream, :name)
      |> (&(Map.get(overloading, :name) || &1)).()

    import_updated_at =
      NaiveDateTime.utc_now()
      |> NaiveDateTime.truncate(:second)

    {genres, tags} =
      stream
      |> Map.get("genres", [])
      |> Enum.join(",")
      |> String.downcase()
      |> TagsClassifier.classify()

    tags = Map.get(overloading, :tags) || tags
    genres = Map.get(overloading, :genres) || genres

    stream_url =
      stream
      |> Map.get("stream_url")
      |> (&(ImporterUtils.replace_value_maybe(&1, @source, existing_stream, :stream_url) || &1)).()
      |> (&(Map.get(overloading, :stream_url) || &1)).()
      |> ImporterUtils.stream_url_transformer()

    %{
      id: id,
      code_name: id,
      external_id:
        Map.get(stream, "name")
        |> ImporterUtils.replace_value_maybe(@source, existing_stream, :external_id),
      name: name,
      img_url: img_url,
      original_img: img_url,
      img: nil,
      website: website,
      stream_url: stream_url,
      original_stream_url: Map.get(stream, "stream_url"),
      tags: tags,
      genres: genres,
      original_tags: Map.get(stream, "tags"),
      country_code: country_code,
      language:
        Map.get(stream, "language")
        |> ImporterUtils.replace_value_maybe(@source, existing_stream, :language),
      enabled: enabled,
      description:
        Map.get(stream, "description")
        |> ImporterUtils.replace_value_maybe(@source, existing_stream, :description),
      import_updated_at: import_updated_at,
      source: ImporterUtils.replace_value_maybe(@source, @source, existing_stream, :source)
    }
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
          original_tags: s.original_tags,
          website: s.website,
          stream_url: s.stream_url,
          original_stream_url: s.original_stream_url,
          enabled: s.enabled,
          import_updated_at: s.import_updated_at,
          source: s.source,
          external_id: s.external_id
        ]
      ],
      conflict_target: :id
    )
  end

  defp find_existing_stream(%{} = data) do
    from(s in Stream,
      where: s.stream_url == ^data["stream_url"],
      limit: 1
    )
    |> Repo.one()
  end
end
