defmodule ProgRadioApi.SongProvider.Tsfjazz do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, default_refresh), do: default_refresh

  @impl true
  def get_data(_name, _last_data) do
    try do
      "https://www.tsfjazz.com/player/qect"
      |> SongProvider.post(%{})
      |> Map.get(:body)
      |> Jason.encode_to_iodata!()
      |> Jason.decode!()
      |> Map.get("current")
    rescue
      _ ->
        nil
    end
  end

  @impl true
  def get_song(name, data) do
    case data do
      nil ->
        Logger.info("Data provider - #{name}: error fetching song data or empty")
        %{}

      _ ->
        %{
          artist: SongProvider.recase(Map.get(data, "artist")),
          title: SongProvider.recase(Map.get(data, "title"))
        }
    end
  end
end