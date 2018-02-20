defmodule Importer.ImageImporter do
  use GenServer

  require Application
  require Logger

  @name :image_importer

  @image_folder "program"

  # ----- Client Interface -----

  def start_link(_arg) do
    Logger.info "Starting the image importer ..."
    GenServer.start_link(__MODULE__, :ok, name: @name)
  end

  def import(url, radio) do
    GenServer.call @name, {:import, url, radio}
  end

  # ----- Server callbacks -----

  def init(:ok) do
    {:ok, nil}
  end

  def handle_call({:import, url, radio}, _from, _state) do
    filename = get_name(url, radio)
    full_path = "#{Application.get_env(:importer, :image_path)}#{@image_folder}/#{filename}"

    unless Importer.ImageCache.is_cached(full_path) do
      try do
        case full_url(url) |> HTTPoison.get() do
          {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
            case File.write(full_path, body) do
              :ok -> {:reply, filename, nil}
              _ -> {:reply, nil, nil}
            end
          _ -> {:reply, nil, nil}
        end
      rescue
        _ ->
          Logger.warn "Error importing image #{url}"
          {:reply, nil, nil}
      catch
        _ -> {:reply, nil, nil}
      end
    else
      {:reply, filename, nil}
    end
  end

  defp full_url(url) do
    if (String.slice(url, 0, 4) != "http") do
      "http:" <> url
    else
      url
    end
  end

  defp get_name(url, radio) do
    name = URI.parse(url)
           |> Map.fetch!(:path)
           |> Path.basename

    "#{radio.code_name}_#{name}"
  end
end
