defmodule Importer.ImageCache do
  require Application

  # 7 days
  @ttl 604_800

  @thumbnails [
    "cache/page_thumb/media/program/",
    "cache/program_thumb/media/program/"
  ]

  def is_cached(filepath) do
    case File.exists?(filepath) do
      true ->
        case File.lstat(filepath, [{:time, :posix}]) do
          {:ok, stat} ->
            case is_ttl_over(stat.mtime) do
              true ->
                delete_cached_files(filepath)
                false

              false ->
                true

              _ ->
                false
            end

          false ->
            false
        end

      false ->
        false
    end
  end

  defp delete_cached_files(filepath) do
    # original image
    File.rm(filepath)

    # thumbnails
    filename = Path.basename(filepath)

    for path <- @thumbnails do
      File.rm(Application.get_env(:importer, :image_path) <> path <> filename)
    end

    :ok
  end

  defp is_ttl_over(datetime) do
    DateTime.to_unix(DateTime.utc_now()) - @ttl > datetime
  end
end
