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
        |> Jason.decode!()
        |> Enum.find(fn r ->
          Map.get(r, "titletv", id) == id
        end)
    rescue
      _ -> nil
    end
  end

  def get_song(name, data) do
    case data do
      nil ->
        Logger.error("Data provider - #{name}: error fetching song data")
        %{}

      _ ->
        %{
          artist: SongProvider.recase(data["artiste"]),
          title: SongProvider.recase(data["titre"]),
          cover_url: data["pochette"] || nil
        }
    end
  end
end
