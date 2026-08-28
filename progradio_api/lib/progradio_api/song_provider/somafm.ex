defmodule ProgRadioApi.SongProvider.Somafm do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, default_refresh), do: default_refresh

  @impl true
  def get_data(name, _last_data) do
    code_name =
      name
      |> SongProvider.get_stream_code_name_from_channel()
      |> String.split("_")
      |> List.last()

    try do
      "https://somafm.com/songs/#{code_name}.json"
      |> SongProvider.get_json()
      |> Map.get("songs", [])
      |> List.first()
    rescue
      _ -> :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      artist = Map.get(data, "artist")
      title = Map.get(data, "title")

      %{artist: artist, title: title}
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
