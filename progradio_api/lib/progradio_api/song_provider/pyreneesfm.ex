defmodule ProgRadioApi.SongProvider.Pyreneesfm do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @url "https://pyreneesfm.com/api/live"

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, default_refresh), do: default_refresh

  @impl true
  def get_data(_name, _last_data) do
    try do
      @url
      |> SongProvider.get_json()
      |> Map.get("nowPlaying", nil)
    rescue
      _ -> :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      %{
        artist: SongProvider.recase(data["artist"]),
        title: SongProvider.recase(data["title"]),
        cover_url: data["artwork"] || nil
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
