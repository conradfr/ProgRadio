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
  def get_data(name, _last_data) do
    try do
      @url
      |> SongProvider.get()
      |> Map.get(:body)
      |> :json.decode()
    rescue
      _ ->
        Logger.debug("Data provider - #{name}: data error rescue")
        :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      %{artist: Map.get(data, "auteur", nil), title: Map.get(data, "titre", nil)}
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
