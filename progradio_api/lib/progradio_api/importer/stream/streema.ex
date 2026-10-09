defmodule ProgRadioApi.Importer.StreamsImporter.Streema do
  require Logger

  alias ProgRadioApi.ImporterStreemaImportWorker

  # the pages downloaded by streema_scrap.js
  @folder "temp_streema"
  @batch_size 500
  # which radio is inserted in dev, to change manually to test another one
  @dev_offset 80000

  def import() do
    Logger.info("Streema import")

    path = "#{Application.get_env(:progradio_api, :image_path)}#{@folder}/"

    radios =
      path
      |> File.ls!()
      |> Enum.filter(&String.ends_with?(&1, ".json"))
      |> Enum.sort()
      |> Stream.flat_map(fn file ->
        (path <> file)
        |> File.read!()
        |> JSON.decode!()
        |> Map.get("radios", [])
      end)

    # to test we only insert one job in dev
    radios =
      if Application.get_env(:progradio_api, :env) == :dev do
        radios |> Stream.drop(@dev_offset) |> Stream.take(200)
      else
        radios
      end

    total =
      radios
      |> Stream.chunk_every(@batch_size)
      |> Enum.reduce(0, fn batch, total ->
        batch
        |> Enum.map(&ImporterStreemaImportWorker.new(%{"slug" => Map.get(&1, "slug")}))
        |> Oban.insert_all()

        total + length(batch)
      end)

    Logger.info("Streema import: #{total} jobs inserted")

    :ok
  end
end
