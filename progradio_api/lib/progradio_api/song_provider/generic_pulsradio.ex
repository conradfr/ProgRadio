defmodule ProgRadioApi.SongProvider.GenericPulsradio do
  require Logger
  alias ProgRadioApi.SongProvider

  def has_custom_refresh(), do: false

  def get_refresh(_name, nil, default_refresh), do: default_refresh

  def get_data(id, _name, _last_data) do
    try do
      "https://api.pulsradio.com/titre.json"
      |> SongProvider.get()
      |> Map.get(:body)
      |> :json.decode()
      |> Enum.find(fn r ->
        Map.get(r, "titletv", id) == id
      end)
    rescue
      _ -> :error
    end
  end

  def get_song(name, data, _last_song) do
    try do
      %{
        artist: SongProvider.recase(data["artiste"]),
        title: SongProvider.recase(data["titre"]),
        cover_url: data["pochette"] || nil
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
