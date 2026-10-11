defmodule ProgRadioApi.Importer.Tools.Images do
  import Ecto.Query, only: [from: 2]

  alias ProgRadioApi.Repo
  alias ProgRadioApi.Stream
  alias ProgRadioApi.Importer.ImageImporter
  alias ProgRadioApi.Importer.Tools.Images

  @max_concurrency 4
  @task_timeout 1_000_000

  def import_images(streams) do
    streams
    |> Task.async_stream(fn s -> import_image(s) end,
         timeout: @task_timeout,
         max_concurrency: @max_concurrency
       )
    |> Enum.reduce([], fn {:ok, s}, acc -> acc ++ [s] end)
  end

  @spec import_image(struct) :: struct
  def import_image(stream, field \\ :img_url) do
    case Map.get(stream, field) do
      url when is_binary(url) and url !== "" ->
        stream =
          if field == :img_url, do: Map.delete(stream, :img_url), else: stream

        try do
          with {:ok, filename} <- ImageImporter.import_stream(url, stream) do
            Map.put(stream, :img, filename)
          else
            _ -> stream
          end
        rescue
          _ ->
            stream
        catch
          _ ->
            stream

          :exit, _ ->
            stream
        end

      _ ->
        stream
    end
  end

  # If a stream has no image (usually from a dead link) we reuse the former one if any,
  # (as we don't delete previous images)
  def reattach_image_of_stream_with_no_image() do
    get_streams_with_no_image()
    |> Enum.map(fn s -> ImageImporter.find_image_for_stream(s) end)
    |> Enum.filter(fn {_stream_id, filename} -> filename != nil end)
    |> Enum.each(&update_stream_with_image/1)
  end

  defp get_streams_with_no_image() do
    from(s in Stream,
      where: is_nil(s.img),
      select: s.id
    )
    |> Repo.all()
  end

  defp update_stream_with_image({stream_id, filename}) do
    query =
      from s in Stream,
           where: s.id == ^stream_id

    Repo.update_all(query, set: [img: filename])
  end
end
