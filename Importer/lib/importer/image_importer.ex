defmodule Importer.ImageImporter do
  require Application
  require Logger
  alias Importer.ImageCache

  @image_folder "program"

  @spec import(String.t(), struct) :: tuple
  def import(url, radio) do
    filename = get_name(url, radio)
    full_path = "#{Application.get_env(:importer, :image_path)}#{@image_folder}/#{filename}"

    unless ImageCache.is_cached(full_path) do
      try do
        case full_url(url)
             |> URI.encode()
             |> HTTPoison.get([], [follow_redirect: true, ssl: [ciphers: :ssl.cipher_suites(), versions: [:"tlsv1.2", :"tlsv1.1", :tlsv1]]]) do
#             |> HTTPoison.get([], [follow_redirect: true]) do
          {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
            case File.write(full_path, body) do
              :ok -> {:ok, filename}
              _ -> {:ok, nil}
            end

          _ ->
            Logger.warn("Error importing image #{url}")
            {:ok, nil}
        end
      rescue
        _ ->
          Logger.warn("Error importing image #{url}")
          {:ok, nil}
      catch
        _ ->
          Logger.warn("Error importing image #{url}")
          {:ok, nil}
      end
    else
      {:ok, filename}
    end
  end

  @spec full_url(String.t()) :: String.t()
  defp full_url(url) do
    if String.slice(url, 0, 4) != "http" do
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
