defmodule ProgRadioApi.Importer.ImageImporter do
  import Mogrify
  require Application
  require Logger
  alias ProgRadioApi.Cache
  alias ProgRadioApi.ImageCache

  @image_folder "program"
  @stream_folder "stream"
  @temp_folder "temp"

  @ls_cache_key "streams_ls"
  @ls_cache_ttl 21_600_000

  @stream_size 125

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

        case File.write!(full_path, Base.decode64!(base64_data["data"]), [:binary]) do
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
         full_path <-
           "#{Application.get_env(:progradio_api, :image_path)}#{@stream_folder}/#{filename}" do
      unless ImageCache.is_cached(full_path) do
        Logger.debug("Importing base64: #{filename} to #{full_path}")

        case File.write!(full_path, Base.decode64!(base64_data["data"]), [:binary]) do
          :ok -> {:ok, filename}
          _ -> {:error, nil}
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

  defp list_stream_files(path) do
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
        "#{Application.get_env(:progradio_api, :image_path)}#{@stream_folder}/#{f}"
        |> File.lstat!([{:time, :posix}])
        |> Map.get(:mtime)
      end,
      :desc
    )
    |> List.first()
  end

  defp process(image_path, dest_path) do
    try do
      image_path
      |> open()
      # will fail if file is not really an image
      |> verbose()
      |> custom("flatten")
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
            HTTPoison.get(
              url_encoded,
              [],
              # testing disabling pool for now
              # hackney: [pool: :image_pool],
              # we have ssl errors that do not happen in a browser ...
              hackney: [:insecure],
              follow_redirect: true,
              recv_timeout: 7500
            )
          rescue
            _ ->
              Logger.warning("Error downloading image (rescue): #{url} to #{dest_path}")
              {:error, nil}
          catch
            _ ->
              Logger.warning("Error downloading image (catch): #{url} to #{dest_path}")
              {:error, nil}
          end
        end)

      http_task_reply =
        case Task.yield(http_task, 10000) || Task.shutdown(http_task) do
          {:ok, result} ->
            result

          {:error, %HTTPoison.Error{reason: :checkout_timeout}} ->
            Logger.warning(
              "Error importing image, checkout_timeout: #{url} - restarting pool ..."
            )

            :hackney_pool.stop_pool(:image_pool)
            nil

          {:exit, reason} ->
            Logger.warning("Error importing image, task exited: #{url} / #{reason}")
            nil

          _ ->
            Logger.warning("Error importing image, task failed: #{url}")
            nil
        end

      case http_task_reply do
        {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
          case File.write(dest_path, body) do
            :ok ->
              {:ok, url}

            _ ->
              Logger.warning("Error importing image, writing failed #{url} / #{dest_path}")
              {:error, nil}
          end

        {:ok, %HTTPoison.Response{status_code: status_code}} ->
          Logger.warning(
            "Error importing image, wrong response: #{status_code} / #{url} / #{dest_path}"
          )

          {:error, nil}

        {:error, %HTTPoison.Error{reason: reason}} when is_atom(reason) ->
          Logger.warning(
            "Error importing image, wrong response: #{Atom.to_string(reason)} #{url} / #{dest_path}"
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
