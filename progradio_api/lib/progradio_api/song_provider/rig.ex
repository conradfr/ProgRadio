defmodule ProgRadioApi.SongProvider.Rig do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @url "https://rigfm.fr/api/nowplaying?include_previous=0"
  @cover_prefix "https://www.rigfm.fr"

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, nil, default_refresh), do: default_refresh

  @impl true
  def get_data(_name, _last_data) do
    try do
      @url
      |> SongProvider.get_json()
    rescue
      _ -> :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      artist = Map.get(data, "artist")
      title = Map.get(data, "title")
      cover_url =
        case Map.get(data, "cover") do
          nil -> nil
          cover -> @cover_prefix <> cover
        end

      %{artist: artist, title: title, cover_url: cover_url}
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
