defmodule ProgRadioApi.SongProvider.Ouifm do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_name %{
    "ouifm_main" => "tele",
    "ouifm_bringthenoise" => "bringthenoise",
    "ouifm_classicrock" => "classicrock",
    "ouifm_acoustic" => "acoustic",
    "ouifm_rockfrancais" => "rockfrancais"
  }

  # 15mn
  @max_length_seconds 900

  @impl true
  def has_custom_refresh(), do: true

  @impl true
  def get_refresh(_name, nil, default_refresh), do: default_refresh

  @impl true
  def get_refresh(_name, data, default_refresh) do
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

  @impl true
  def get_data(name, _last_data) do
    name =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_name, &1)).()

    try do
      entry =
        HTTPoison.get!(
          "https://player.ouifm.fr/api/songs",
          [],
          ssl: [ciphers: :ssl.cipher_suites(), versions: [:"tlsv1.2", :"tlsv1.1", :tlsv1]]
        )
        |> Map.get(:body)
        |> Jason.decode!()
        |> Map.get(name, %{})
        |> List.first()

      # we filter if data is too old
      max_end_song = entry["ts"] + @max_length_seconds

      now =
        DateTime.now!("Etc/UTC")
        |> DateTime.to_unix()

      case now > max_end_song do
        true -> nil
        false -> entry
      end
    rescue
      _ -> nil
    end
  end

  @impl true
  def get_song(name, data) do
    case data do
      nil ->
        Logger.error("Data provider - #{name}: error fetching song data")
        %{}

      _ ->
        %{artist: SongProvider.recase(data["artist"]), title: SongProvider.recase(data["title"])}
    end
  end
end
