defmodule ProgRadioApi.DataProvider.Couleur3 do
  require Logger

  @behaviour ProgRadioApi.DataProvider

  @impl true
  def get_refresh(_name, data, default_refresh) do
    case data do
      nil ->
        nil

      _ ->
        now =
          DateTime.utc_now()
          |> DateTime.to_iso8601()

        {:ok, start_current_song, _} =
          Map.get(data, "date", now)
          |> DateTime.from_iso8601()

        start_current_song_unix = DateTime.to_unix(start_current_song)

        start_current_song_unix
        |> (&((&1 + 2 + Map.get(data, "duration", default_refresh) / 1000 - &1) * 1000)).()
        |> trunc()
        |> abs()
    end
  end

  @impl true
  def get_data(_name) do
    HTTPoison.get!(
      "https://il.srgssr.ch/integrationlayer/2.0/rts/songList/radio/byChannel/8ceb28d9b3f1dd876d1df1780f908578cbefc3d7?vector=portalplay&onlyCurrentSong=true&pageSize=40",
      [],
      ssl: [ciphers: :ssl.cipher_suites(), versions: [:"tlsv1.2", :"tlsv1.1", :tlsv1]]
    )
    |> Map.get(:body)
    |> Jason.decode!()
    |> Map.get("songList", %{})
    |> List.first()
  end

  @impl true
  def get_song(name, data) do
    case data do
      nil ->
        Logger.error("Data provider - #{name}: error fetching song data")
        %{}

      _ ->
        %{interpreter: data["artist"]["name"], title: data["title"]}
    end
  end
end
