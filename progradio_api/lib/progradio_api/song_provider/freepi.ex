defmodule ProgRadioApi.SongProvider.Freepi do
  require Logger
  alias ProgRadioApi.SongProvider

  # adapted from asura_hosting.ex

  @behaviour ProgRadioApi.SongProvider

  @forbidden_titles ["Stream not found", " - "]

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    Logger.debug("Data provider - #{name} (freepi): data")

    try do
      data =
        name
        |> String.split(":", parts: 2)
        |> List.last()
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
        Logger.debug("Data provider - #{name} (freepi): data error rescue")
        :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      Logger.debug("Data provider - #{name} (freepi): song")

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
        Logger.debug("Data provider - #{name} (freepi): song error rescue")
        :error
    end
  end
end
