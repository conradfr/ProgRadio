defmodule ProgRadioApi.SongProvider.Espace2 do
  require Logger

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.rts.ch/play/v3/api/rts/production/radio/song-log?channelId=a83f29dee7a5d0d3f9fccdb9c92161b1afb512db"

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(_name, _last_data) do
    HTTPoison.get!(
      @url,
      [],
      ssl: [ciphers: :ssl.cipher_suites(), versions: [:"tlsv1.2", :"tlsv1.1", :tlsv1]]
    )
    |> Map.get(:body)
    |> Jason.decode!()
    |> Map.get("data", %{})
    |> Map.get("songs", %{})
    |> Enum.find(fn e -> Map.get(e, "isPlayingNow", 0) == true end)
  end

  @impl true
  def get_song(name, data) do
    case data do
      nil ->
        Logger.error("Data provider - #{name}: error fetching song data")
        %{}

      _ ->
        %{artist: data["artist"], title: data["title"]}
    end
  end
end
