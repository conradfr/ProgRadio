defmodule ProgRadioApi.DataProvider.Radionova do
  require Logger
  alias ProgRadioApi.DataProvider

  @behaviour ProgRadioApi.DataProvider

  @stream_name %{
    "radionova_main" => "radio-nova",
    "radionova_nouvo" => "nouvo-nova",
    "radionova_danse" => "nova-danse",
    "radionova_lanuit" => "nova-la-nuit",
    "radionova_classics" => "nova-classics"
  }

  @impl true
  def has_custom_refresh(), do: true

  @impl true
  def get_refresh(_name, data, _default_refresh) do
    case data do
      nil ->
        nil

      _ ->
        now_unix =
          DateTime.utc_now()
          |> DateTime.to_unix()

        {:ok, start_current_song_naive} =
          Map.get(data, "diffusion_date")
          |> NaiveDateTime.from_iso8601()

        {:ok, start_current_song} =
          start_current_song_naive
          |> DateTime.from_naive("Europe/Paris")

        start_current_song_unix =
          start_current_song
          |> DateTime.to_unix()

        {:ok, time_end} =
          ("00:" <> Map.get(data, "duration", "00:30"))
          |> Time.from_iso8601()

        {time_end_seconds, _} =
          time_end
          |> Time.to_seconds_after_midnight()

        next_seconds = (start_current_song_unix + time_end_seconds - now_unix + 2) * 1000

        next_seconds
        |> trunc()
        |> abs()
    end
  end

  @impl true
  def get_data(name) do
    name =
      DataProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_name, &1)).()

    HTTPoison.get!(
      "https://www.nova.fr/wp-json/radios/" <> name,
      [],
      ssl: [ciphers: :ssl.cipher_suites(), versions: [:"tlsv1.2", :"tlsv1.1", :tlsv1]]
    )
    |> Map.get(:body)
    |> Jason.decode!()
    |> Map.get("currentTrack", %{})
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
