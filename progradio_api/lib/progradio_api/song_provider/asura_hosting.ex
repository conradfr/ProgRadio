defmodule ProgRadioApi.SongProvider.AsuraHosting do
  require Logger
  alias ProgRadioApi.SongProvider

  # doc https://www.asurahosting.com/guides/streaming/centovacast/obtaining-your-https-link/

  @behaviour ProgRadioApi.SongProvider

  @forbidden_titles ["Stream not found", " - "]

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    Logger.debug("Data provider - #{name} (asura_hosting): data")

    url =
      name
      |> String.split(":", parts: 2)
      |> List.last()

    # stream can be icecast or shoutcast and will have different metadata endpoint

    cond do
      # todo not do cond has shoutcast failing will move to icecast?
      String.contains?(url, "/stream") -> get_shoutcast_data(url)
      String.contains?(url, "/live") -> get_icecast_data(url)
      true -> nil
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      Logger.debug("Data provider - #{name} (asura_hosting): song")

      if data != nil and data != :error and is_binary(data) and data != "" and
           String.contains?(data, "Error 404") == false and
           Enum.member?(@forbidden_titles, data) == false do
        %{
          artist: data,
          title: nil,
          cover_url: nil
        }
      else
        nil
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (asura_hosting): song error rescue")
        :error
    end
  end

  defp get_shoutcast_data(url) do
    Logger.debug("Data provider - #{url} (asura_hosting shoutcast): data")

    try do
      url
      |> String.split("/stream")
      |> hd()
      |> Kernel.<>("/currentsong")
      |> SongProvider.get()
      |> Map.get(:body)
    rescue
      _ ->
        Logger.debug("Data provider - #{url} (asura_hosting shoutcast): data error rescue")
        :error
    end
  end

  defp get_icecast_data(url) do
    Logger.debug("Data provider - #{url} (asura_hosting icecast): data")

    try do
      data =
        url
        |> String.split("/live")
        |> hd()
        |> Kernel.<>("/status-json.xsl")
        |> SongProvider.get()
        |> Map.get(:body)
        |> :json.decode()
        |> Map.get("icestats", %{})
        |> Map.get("source")

      SongProvider.get_song_from_icecast(data)
    rescue
      _ ->
        Logger.debug("Data provider - #{url} (asura_hosting icecast): data error rescue")
        :error
    end
  end
end
