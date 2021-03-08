defmodule ProgRadioApi.ImageCache do
  require Application

  # 7 days
  @ttl 604_800

  @thumbnails [
    "cache/page_thumb/media/program/",
    "cache/program_thumb/media/program/",
    "cache/stream_thumb/media/stream/"
  ]

  @spec is_cached(String.t()) :: boolean
  def is_cached(filepath) do
    with file_exists when file_exists == true <- File.exists?(filepath),
         {:ok, stat} <- File.lstat(filepath, [{:time, :posix}]) do
      case is_ttl_over(stat.mtime) do
        true ->
          delete_cached_files(filepath)
          false

        false ->
          true
      end
    else
      _ -> false
    end
  end

  @spec is_ttl_over(integer) :: boolean
  defp is_ttl_over(datetime) do
    DateTime.to_unix(DateTime.utc_now()) - @ttl > datetime
  end

  @spec delete_cached_files(String.t()) :: atom
  defp delete_cached_files(filepath) do
    # original image
    File.rm(filepath)

    # thumbnails
    filename = Path.basename(filepath)

    for path <- @thumbnails do
      File.rm(Application.get_env(:progradio_api, :image_path) <> path <> filename)
    end

    :ok
  end
end
