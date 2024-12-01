defmodule ProgRadioApi.SongProvider.Radioclassique do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @url "https://d3gf3bsqck8svl.cloudfront.net/direct-metadata/current.json"

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(_name, _last_data) do
    @url
    |> SongProvider.get()
    |> Map.get(:body)
    |> Jason.decode!()
  end

  @impl true
  def get_song(name, data) do
    case data do
      nil ->
        Logger.error("Data provider - #{name}: error fetching song data")
        %{}

      map when is_map(map) ->
        %{artist: Map.get(data, "auteur", nil), title: Map.get(data, "titre", nil)}

      _ ->
        %{}
    end
  end
end
