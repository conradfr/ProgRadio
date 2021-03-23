defmodule ProgRadioApi.Importer.ImageImporter do
  import Mogrify
  require Application
  require Logger
  alias ProgRadioApi.ImageCache

  @image_folder "program"
  @stream_folder "stream"
  @temp_folder "temp"

  @spec import(String.t(), struct) :: tuple
  def import(url, radio) do
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

  @spec import_stream(String.t(), struct) :: tuple
  def import_stream(url, radio) do
    filename = get_name(url, radio)
    full_path = "#{Application.get_env(:progradio_api, :image_path)}#{@stream_folder}/#{filename}"

    full_path_temp =
      "#{Application.get_env(:progradio_api, :image_path)}#{@temp_folder}/#{filename}"

    unless ImageCache.is_cached(full_path) do
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

  defp process(image_path, dest_path) do
    try do
      image_path
      |> open()
      # will fail if file is not really an image
      |> verbose()
      |> custom("strip")
      |> resize_to_limit(125)
      |> custom("density", "72")
      #      |> format("png")
      |> save(path: dest_path)
    rescue
      _ ->
        Logger.warn("Error processing stream image: #{image_path}")
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
      url_encoded = URI.encode(url)

      # we put it in a task to have a timeout if we get a never-ending stream instead of an image
      http_task =
        Task.async(fn ->
          try do
            HTTPoison.get(
              url_encoded,
              [],
              hackney: [pool: :image_pool],
              follow_redirect: true,
              ssl: [ciphers: :ssl.cipher_suites(), versions: [:"tlsv1.2", :"tlsv1.1", :tlsv1]],
              recv_timeout: 5000
            )
          rescue
            _ ->
              Logger.warn("Error downloading image: #{url}")
              {:error, nil}
          end
        end)

      http_task_reply =
        case Task.yield(http_task, 10000) || Task.shutdown(http_task) do
          {:ok, result} ->
            result

          {:exit, reason} ->
            Logger.warn("Error importing image, task exited: #{url} / #{reason}")
            nil

          nil ->
            Logger.warn("Error importing image, task failed: #{url}")
            nil
        end

      case http_task_reply do
        {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
          case File.write(dest_path, body) do
            :ok ->
              {:ok, url}

            _ ->
              Logger.warn("Error importing image, writing failed #{url} / #{dest_path}")
              {:error, nil}
          end

        _ ->
          Logger.warn("Error importing image, wrong response: #{url}")
          {:error, nil}
      end
    rescue
      _ ->
        Logger.warn("Error importing image #{url}")
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
