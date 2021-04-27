defmodule ProgRadioApi.SongProvider.Alouette do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @minutes_max 300
  @timezone "Europe/Paris"

  @impl true
  def has_custom_refresh(), do: true

  @impl true
  def get_refresh(_name, _data, default_refresh), do: default_refresh

  @impl true
  def get_data(_name) do
    now_unix =
      DateTime.now!(@timezone)
      |> DateTime.to_unix()

    data =
      HTTPoison.get!(
        "https://www.alouette.fr/players/index/gettitrageplayer/idplayers/2174546520932614169",
        [],
        ssl: [ciphers: :ssl.cipher_suites(), versions: [:"tlsv1.2", :"tlsv1.1", :tlsv1]]
      )
      |> Map.get(:body)
      |> Jason.decode!()

    time_end = Map.get(data, "time", 0) + @minutes_max

    if now_unix >= Map.get(data, "time", now_unix - 1) and now_unix <= time_end do
      data
    else
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
        %{artist: SongProvider.recase(data["artist"]), title: SongProvider.recase(data["title"])}
    end
  end
end
