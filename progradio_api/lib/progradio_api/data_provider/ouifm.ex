defmodule ProgRadioApi.DataProvider.Ouifm do
  require Logger

  @behaviour ProgRadioApi.DataProvider

  @impl true
  def has_custom_refresh(), do: true

  @impl true
  def get_refresh(_name, data, default_refresh) do
    case data do
      nil ->
        nil

      _ ->
        now =
          DateTime.utc_now()
          |> DateTime.to_iso8601()

        {:ok, start_current_song_naive} =
          Map.get(data, "date", now)
          |> NaiveDateTime.from_iso8601()

        {:ok, start_current_song} =
          start_current_song_naive
          |> DateTime.from_naive("Europe/Paris")

        start_current_song_unix = DateTime.to_unix(start_current_song)

        start_current_song_unix
        |> (&((&1 + Map.get(data, "length", default_refresh) / 1000 - &1) * 1000)).()
        |> trunc()
        |> abs()
    end
  end

  @impl true
  def get_data(_name) do
    HTTPoison.get!(
      "https://player.ouifm.fr/api/songs",
      [],
      ssl: [ciphers: :ssl.cipher_suites(), versions: [:"tlsv1.2", :"tlsv1.1", :tlsv1]]
    )
    |> Map.get(:body)
    |> Jason.decode!()
    |> Map.get("tele", %{})
    |> List.first()
  end

  @impl true
  def get_song(name, data) do
    case data do
      nil ->
        Logger.error("Data provider - #{name}: error fetching song data")
        %{}

      _ ->
        %{interpreter: data["artist"], title: data["title"]}
    end
  end
end
