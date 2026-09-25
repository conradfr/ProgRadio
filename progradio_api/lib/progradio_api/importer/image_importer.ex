defmodule ProgRadioApi.Importer.ImageImporter do
  import Mogrify
  require Logger
  alias ProgRadioApi.Cache
  alias ProgRadioApi.ImageCache
  alias ProgRadioApi.Utils.ReqUtils

  @image_folder "program"
  @stream_folder "stream"
  @temp_folder "temp"

  @ls_cache_key "streams_ls"
  @ls_cache_ttl 21_600_000

  @stream_size 125
  # seconds
  @rsvg_timeout 10

  @spec import(String.t(), map, struct) :: tuple
  def import(filename_or_base64, show, radio)

  # when base64
  def import("data:" <> _base64 = base64_raw, show, radio) do
    with %{} = base64_data <-
           Regex.named_captures(~r/data:(?<type>[a-zA-Z\/]*);base64,(?<data>[^\"]*)/, base64_raw),
         extension <- base64_data["type"] |> MIME.extensions() |> List.first(),
         filename <- "#{get_name(show["title"], radio)}.#{extension}",
         full_path <-
           "#{Application.get_env(:progradio_api, :image_path)}#{@image_folder}/#{filename}" do
      unless ImageCache.is_cached(full_path) do
        Logger.debug("Importing base64: #{filename} to #{full_path}")

        File.mkdir_p(Path.dirname(full_path))

        case File.write(full_path, Base.decode64!(base64_data["data"]), [:binary]) do
          :ok -> {:ok, filename}
          _ -> {:error, nil}
        end
      else
        Logger.debug("Program image #{filename} was cached")
        {:ok, filename}
      end
    else
      _ ->
        Logger.debug("Error importing base64")
        {:error, nil}
    end
  end

  def import("http" <> _rest_of_url = url, _show, radio) do
    filename = get_name(url, radio)
    full_path = "#{Application.get_env(:progradio_api, :image_path)}#{@image_folder}/#{filename}"

    unless ImageCache.is_cached(full_path) do
      full_url = full_url(url)
      Logger.debug("Importing: #{full_url}")

      case download(full_url, full_path) do
        {:ok, _} -> {:ok, filename}
        _ -> {:error, nil}
      end
    else
      Logger.debug("Program image #{filename} was cached")
      {:ok, filename}
    end
  end

  def import(_url, _show, _radio), do: {:error, nil}

  @spec import_stream(String.t(), struct) :: tuple
  def import_stream(url, radio)

  # when base64
  def import_stream("data:" <> _base64 = base64_raw, radio) do
    with %{} = base64_data <-
           Regex.named_captures(~r/data:(?<type>[a-zA-Z\/]*);base64,(?<data>[^\"]*)/, base64_raw),
         extension <- base64_data["type"] |> MIME.extensions() |> List.first(),
         filename <- "#{radio.id}.#{extension}",
         full_path_temp <-
           "#{Application.get_env(:progradio_api, :image_path)}#{@temp_folder}/#{filename}",
         full_path <-
           "#{Application.get_env(:progradio_api, :image_path)}#{@stream_folder}/#{filename}" do
      unless ImageCache.is_cached(full_path) do
        Logger.debug("Importing base64: #{filename} to #{full_path}")

        File.mkdir_p(Path.dirname(full_path_temp))

        case File.write(full_path_temp, Base.decode64!(base64_data["data"]), [:binary]) do
          :ok ->
            case process(full_path_temp, full_path) do
              {:ok, _} -> {:ok, filename}
              _ -> {:error, nil}
            end

          _ ->
            {:error, nil}
        end
      else
        Logger.debug("Stream image #{filename} was cached")
        {:ok, filename}
      end
    else
      _ ->
        Logger.debug("Error importing base64")
        {:error, nil}
    end
  end

  def import_stream(url, radio) do
    filename = get_name(url, radio)

    case svg?(filename) do
      true -> import_stream_svg(url, filename)
      false -> import_stream_raster(url, filename)
    end
  end

  # svg are rasterised to png by rsvg-convert, imagemagick is not allowed to read svg (see policy.xml)
  defp import_stream_svg(url, svg_filename) do
    filename = Path.rootname(svg_filename) <> ".png"
    full_path = "#{Application.get_env(:progradio_api, :image_path)}#{@stream_folder}/#{filename}"

    full_path_temp_svg =
      "#{Application.get_env(:progradio_api, :image_path)}#{@temp_folder}/#{svg_filename}"

    full_path_temp =
      "#{Application.get_env(:progradio_api, :image_path)}#{@temp_folder}/#{filename}"

    unless ImageCache.is_cached(full_path, false) do
      full_url = full_url(url)
      Logger.debug("Importing svg: #{full_url}")

      try do
        with {:ok, _} <- download(full_url, full_path_temp_svg),
             {:ok, _} <- rasterize_svg(full_path_temp_svg, full_path_temp),
             {:ok, _} <- process(full_path_temp, full_path) do
          {:ok, filename}
        else
          _ -> {:error, nil}
        end
      after
        File.rm(full_path_temp_svg)
        File.rm(full_path_temp)
      end
    else
      Logger.debug("Stream image #{filename} was cached")
      {:ok, filename}
    end
  end

  defp import_stream_raster(url, filename) do
    full_path = "#{Application.get_env(:progradio_api, :image_path)}#{@stream_folder}/#{filename}"

    full_path_temp =
      "#{Application.get_env(:progradio_api, :image_path)}#{@temp_folder}/#{filename}"

    unless ImageCache.is_cached(full_path, false) do
      full_url = full_url(url)
      Logger.debug("Importing: #{full_url}")

      case download(full_url, full_path_temp) do
        {:ok, _} ->
          case process(full_path_temp, full_path) do
            {:ok, _} -> {:ok, filename}
            _ -> {:error, nil}
          end

        _ ->
          {:error, nil}
      end
    else
      Logger.debug("Stream image #{filename} was cached")
      {:ok, filename}
    end
  end

  def find_image_for_stream(stream_id) do
    filename =
      "#{Application.get_env(:progradio_api, :image_path)}#{@stream_folder}/"
      |> list_stream_files()
      |> Enum.filter(fn f -> String.starts_with?(f, stream_id) == true end)
      |> pick_more_recent_image()

    case filename do
      nil -> {stream_id, nil}
      _ -> {stream_id, filename}
    end
  end

  def list_stream_files(path) do
    case Cache.has_key?(@ls_cache_key) do
      true ->
        Cache.get(@ls_cache_key)

      false ->
        files = File.ls!(path)
        Cache.put(@ls_cache_key, files, ttl: @ls_cache_ttl)
        files
    end
  end

  defp pick_more_recent_image(filenames) when length(filenames) == 0, do: nil
  defp pick_more_recent_image(filenames) when length(filenames) == 1, do: hd(filenames)

  defp pick_more_recent_image(filenames) do
    filenames
    |> Enum.sort_by(
      fn f ->
        path = "#{Application.get_env(:progradio_api, :image_path)}#{@stream_folder}/#{f}"

        # file may be gone since the ls cache was built, or have a mis-encoded name
        case File.lstat(path, [{:time, :posix}]) do
          {:ok, %File.Stat{mtime: mtime}} -> mtime
          _ -> 0
        end
      end,
      :desc
    )
    |> List.first()
  end

  defp svg?(filename), do: filename |> Path.extname() |> String.downcase() == ".svg"

  # rsvg-convert with -w/-h/-a covers the box instead of fitting in it, process/2 resizes it afterwards.
  # it does not load external resources (file:// or http) referenced in the svg.
  @spec rasterize_svg(String.t(), String.t()) :: tuple
  defp rasterize_svg(svg_path, dest_path) do
    size = Integer.to_string(@stream_size)

    # timeout (coreutils) kills rsvg-convert on a svg that takes forever to render
    case System.cmd(
           "timeout",
           [
             Integer.to_string(@rsvg_timeout),
             "rsvg-convert",
             "-w",
             size,
             "-h",
             size,
             "-a",
             "-f",
             "png",
             "-o",
             dest_path,
             svg_path
           ],
           stderr_to_stdout: true
         ) do
      {_, 0} ->
        {:ok, dest_path}

      {output, exit_code} ->
        Logger.warning(
          "Error rasterizing svg (#{exit_code}): #{svg_path} - #{String.slice(output, 0, 200)}"
        )

        {:error, nil}
    end
  rescue
    # missing executable
    e ->
      Logger.warning("Error rasterizing svg: #{svg_path} - #{Exception.message(e)}")
      {:error, nil}
  end

  defp process(image_path, dest_path) do
    try do
      image_path
      |> open()
      # will fail if file is not really an image
      |> verbose()
      #      |> custom("flatten")
      |> custom("strip")
      |> resize_to_limit(@stream_size)
      |> custom("density", "72")
      #      |> format("png")
      |> save(path: dest_path)
    rescue
      _ ->
        Logger.warning("Error processing stream image: #{image_path}")
        {:error, nil}
    after
      File.rm(image_path)
    else
      _ -> {:ok, nil}
    end
  end

  @spec download(String.t(), String.t()) :: tuple
  defp download(url, dest_path) do
    try do
      # only encode url if not already encoded
      url_encoded =
        case URI.decode(url) do
          decoded_url when decoded_url != url -> url
          _ -> URI.encode(url)
        end

      # we put it in a task to have a timeout if we get a never-ending stream instead of an image
      http_task =
        Task.async(fn ->
          try do
            Req.get(
              url_encoded,
              # verify_none in default options for https: we have ssl errors that do not happen in a browser ...
              ReqUtils.get_options_for(
                url_encoded,
                receive_timeout: 7500,
                # the task timeout below would kill retries anyway
                retry: false,
                # keep the raw image bytes
                decode_body: false
              )
            )
          rescue
            _ ->
              Logger.warning("Error downloading image (rescue): #{url} to #{dest_path}")
              {:error, nil}
          catch
            # finch/mint can exit (e.g. :badarg from :gen_tcp), an exit would also kill the caller via the task link
            _kind, _ ->
              Logger.warning("Error downloading image (catch): #{url} to #{dest_path}")
              {:error, nil}
          end
        end)

      http_task_reply =
        case Task.yield(http_task, 10000) || Task.shutdown(http_task) do
          {:ok, result} ->
            result

          {:exit, reason} ->
            Logger.warning("Error importing image, task exited: #{url} / #{reason}")
            nil

          _ ->
            Logger.warning("Error importing image, task failed: #{url}")
            nil
        end

      case http_task_reply do
        {:ok, %Req.Response{status: 200, body: body}} ->
          # media sub folders may not exist yet (fresh checkout / volume)
          File.mkdir_p(Path.dirname(dest_path))

          case File.write(dest_path, body) do
            :ok ->
              {:ok, url}

            _ ->
              Logger.warning("Error importing image, writing failed #{url} / #{dest_path}")
              {:error, nil}
          end

        {:ok, %Req.Response{status: status}} ->
          Logger.warning(
            "Error importing image, wrong response: #{status} / #{url} / #{dest_path}"
          )

          {:error, nil}

        {:error, exception} when is_exception(exception) ->
          Logger.warning(
            "Error importing image, wrong response: #{Exception.message(exception)} #{url} / #{dest_path}"
          )

          {:error, nil}

        _ ->
          Logger.warning("Error importing image, wrong response: #{url} / #{dest_path}")
          {:error, nil}
      end
    rescue
      _ ->
        Logger.warning("Error importing image #{url}")
        {:error, nil}
    end
  end

  @spec full_url(String.t()) :: String.t()
  defp full_url(url) do
    if String.slice(url, 0, 4) |> String.downcase() != "http" do
      "http:" <> url
    else
      url
    end
  end

  @spec get_name(String.t(), struct) :: String.t()
  defp get_name(url, radio) do
    name =
      URI.parse(url)
      |> Map.fetch!(:path)
      |> URI.decode()
      |> Path.basename()

    hash =
      :erlang.md5(url)
      |> Base.encode16()

    "#{radio.code_name}_#{hash}_#{name}"
  end
end
