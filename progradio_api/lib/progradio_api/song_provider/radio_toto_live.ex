defmodule ProgRadioApi.SongProvider.RadioTotoLive do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @base_url "https://radios-totolive.fr"

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, default_refresh), do: default_refresh

  @impl true
  def get_data(_name, _last_data, _db_song_data) do
    try do
      "#{@base_url}/api/update-nowplaying.php"
      |> SongProvider.get_json()
    rescue
      _ -> :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      {artist, title} =
        case Map.get(data, "artist") do
          nil -> {Map.get(data, "title"), nil}
          artist -> {artist, Map.get(data, "title")}
        end

      %{
        artist: artist,
        title: title,
        cover_url: data |> Map.get("cover") |> cover_url()
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end

  defp cover_url("http" <> _ = cover), do: cover
  defp cover_url("/" <> _ = cover), do: @base_url <> cover
  defp cover_url(cover) when is_binary(cover) and cover != "", do: @base_url <> "/" <> cover
  defp cover_url(_cover), do: nil
end
