defmodule ProgRadioApi.SongProvider.Ihaveadream do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @impl true
  def has_custom_refresh(), do: false

  def get_refresh(_name, _data, default_refresh), do: default_refresh

  @impl true
  def get_data(name, last_data) do
    try do
      "https://www.radio-ihaveadream.com/info-radio-live"
      |> SongProvider.get()
      |> Map.get(:body)
      |> Jason.decode!()
      |> List.first()
    rescue
      _ -> nil
    end
  end

  @impl true
  def get_song(name, data) do
    case data do
      nil ->
        Logger.info("Data provider - #{name}: error fetching song data or empty")
        %{}

      _ ->
        [_, _, artist, title] = data
        %{artist: artist, title: title}
    end
  end
end
