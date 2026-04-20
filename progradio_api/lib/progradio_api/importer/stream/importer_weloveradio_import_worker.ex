defmodule ProgRadioApi.ImporterWeLoveRadioImportWorker do
  use Oban.Worker, queue: :import_stream_weloveradio
  import Ecto.Query, warn: false, only: [from: 2]
  require Logger

  alias ProgRadioApi.Repo
  alias ProgRadioApi.Utils.ImporterUtils
  alias ProgRadioApi.Stream

  @source_name "weloveradio"

  @impl Oban.Worker
  def perform(%Oban.Job{args: args}) do
    Logger.debug("Stream import job: WeLoveRadio")

    # todo manage overloading

    try do
      import_updated_at =
        NaiveDateTime.utc_now()
        |> NaiveDateTime.truncate(:second)

      website =
        ["website", "facebook", "twitter"]
        |> Enum.find_value(fn key ->
          case Map.get(args, "external_links", %{})[key] do
            nil -> nil
            "null" -> nil
            val -> val
          end
        end)

      stream_url =
        ["high", "standard", "low"]
        |> Enum.find_value(fn key ->
          case Map.get(args, "listening_links", %{})[key] do
            nil -> nil
            "null" -> nil
            val -> val
          end
        end)

      tags =
        Map.get(args, "genres", [])
        |> Enum.map(&String.downcase(&1["name"]))
        |> Enum.join(",")

      tags =
        case tags do
          "" -> nil
          value -> value
        end

      id = find_existing_stream(args) || Ecto.UUID.bingenerate() |> Ecto.UUID.cast!()

      slogan =
        case Map.get(args, "slogan") do
          "null" -> nil
          "" -> nil
          value -> value
        end

      description =
        case Map.get(args, "description") do
          "null" -> nil
          "" -> nil
          value -> value
        end

      stream =
        %{
          id: id,
          code_name: id,
          external_id: Integer.to_string(args["radio_id"]),
          source: @source_name,
          name: args["name"],
          img_url: args["logo"],
          original_img: args["logo"],
          img: nil,
          website: website,
          stream_url: stream_url,
          original_stream_url: stream_url,
          tags: tags,
          original_tags: tags,
          country_code: Map.get(args, "country"),
          slogan: slogan,
          description: description,
          language: Map.get(args, "lang"),
          enabled: true,
          redirect_to: nil,
          import_updated_at: import_updated_at
        }

      stream =
        [stream]
        |> ImporterUtils.import_images()
        |> List.first()

      Logger.debug("Stream import job: WeLoveRadio: #{stream.name}")

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

      # if we find a duplicate we use the weloveradio as the reference as the data is probably better
      # so we redirect the other one to it and rewrite any user favorite to the new one
      # todo manage if more than one?
      case find_duplicate_stream(args) do
        nil ->
          Logger.debug("no duplicate found")

        duplicated_stream ->
          {:ok, new_stream_id} = Ecto.UUID.dump(stream.id)

          duplicated_stream
          |> Stream.changeset_redirect_to(%{redirect_to: stream.id})
          |> Repo.update!()

          from(us in "users_streams",
            where: us.stream_id == type(^duplicated_stream.id, :binary_id)
          )
          |> Repo.update_all(set: [stream_id: new_stream_id])
      end
    rescue
      _ ->
        Logger.error("Stream import job: WeLoveRadio - rescue")
    end

    :ok
  end

  defp find_existing_stream(%{} = data) do
    from(s in Stream,
      where: s.external_id == ^Integer.to_string(data["radio_id"]) and s.source == @source_name,
      limit: 1,
      select: s.id
    )
    |> Repo.one()
  end

  # we try to find an existing stream from other source with the same name and country code
  defp find_duplicate_stream(%{} = data) do
    from(s in Stream,
      where:
        fragment("LOWER(?) = ?", s.name, ^String.downcase(data["name"])) and
          s.country_code == ^data["country"] and s.enabled == true and
          s.banned == false and is_nil(s.redirect_to) and s.source != @source_name,
      order_by: [desc: s.score, desc: s.clicks_last_24h, desc: s.votes],
      limit: 1
    )
    |> Repo.one()
  end
end
