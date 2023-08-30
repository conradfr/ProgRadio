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
  def is_cached(filepath, delete_if_ttl_over \\ true) when is_binary(filepath) do
    with file_exists when file_exists == true <- File.exists?(filepath),
         {:ok, stat} <- File.lstat(filepath, [{:time, :posix}]) do
      case is_ttl_over(stat.mtime) do
        true ->
          if delete_if_ttl_over == true, do: delete_cached_files(filepath)
          false

        false ->
          true
      end
    else
      _ -> false
    end
  end

  @spec is_ttl_over(integer) :: boolean
  defp is_ttl_over(datetime) when is_number(datetime) do
    System.os_time(:second) - @ttl > datetime
  end

  @spec delete_cached_files(String.t()) :: atom
  defp delete_cached_files(filepath) when is_binary(filepath) do
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
