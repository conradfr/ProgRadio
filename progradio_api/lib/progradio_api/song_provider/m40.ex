defmodule ProgRadioApi.SongProvider.M40 do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, default_refresh), do: default_refresh

  @impl true
  def get_data(_name, _last_data) do
    try do
      "https://m40radio.fr/wp-json/pmr/v1/now-playing"
      |> SongProvider.get_json()
    rescue
      _ ->
        nil
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      %{
        artist: SongProvider.recase(Map.get(data, "artist")),
        title: SongProvider.recase(Map.get(data, "title")),
        cover_url: Map.get(data, "cover")
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
