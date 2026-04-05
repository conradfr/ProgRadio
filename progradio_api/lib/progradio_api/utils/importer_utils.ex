defmodule ProgRadioApi.Utils.ImporterUtils do
  alias ProgRadioApi.Importer.ImageImporter

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
        case String.ends_with?(url, ".svg") do
          false ->
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

          true ->
            stream
        end

      _ ->
        stream
    end
  end
end
