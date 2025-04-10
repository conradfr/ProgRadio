defmodule ProgRadioApi.SongProvider.Radiobob do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "radiobob_livestream" => 65,
    "radiobob_alternative" => 15,
    "radiobob_classic_rock" => 16,
    "radiobob_acdc" => 72,
    "radiobob_power_metal" => 664,
    "radiobob_symphonic_metal" => 510,
    "radiobob_progrock" => 566,
    "radiobob_rock_party" => 384,
    "radiobob_best_rock" => 96,
    "radiobob_70_rock" => 665,
    "radiobob_80_rock" => 97,
    "radiobob_90_rock" => 98,
    "radiobob_2000_rock" => 565,
    "radiobob_harte_saite" => 14,
    "radiobob_mittel_rock" => 234,
    "radiobob_wacken" => 135,
    "radiobob_metal" => 99,
    "radiobob_stoner" => 690,
    "radiobob_ska" => 682,
    "radiobob_punk" => 103,
    "radiobob_blues" => 557,
    "radiobob_deutschrock" => 81,
    "radiobob_nu_metal" => 745,
    "radiobob_mittel_alter" => 234,
    "radiobob_hardrock" => 101,
    "radiobob_rock_hits" => 95,
    "radiobob_grunge" => 102,
    "radiobob_metalcore" => 347,
    "radiobob_death_metal" => 511,
    "radiobob_roadtrip" => 688,
    "radiobob_folk" => 687,
    "radiobob_country" => 567,
    "radiobob_festival" => 105,
    "radiobob_gothic" => 235,
    "radiobob_rockabilly" => 104,
    "radiobob_christmas" => 76,
  }

  @impl true
  def has_custom_refresh(), do: true

  @impl true
  def get_refresh(_name, data, default_refresh) do
    case data do
      nil -> default_refresh

      _ ->
        try do
          now_unix = SongProvider.now_unix()

          {:ok, time_start, _} =
            data
            |> Map.get("airtime")
            |> DateTime.from_iso8601()

          duration = Map.get(data, "duration") |> String.to_integer()

          next_time =
            time_start
            |> DateTime.add(duration, :second)
            |> DateTime.to_unix()

          next = next_time - now_unix

          if now_unix + next < now_unix do
            default_refresh
          else
            next * 1000
          end
        rescue
          _ -> default_refresh
        end
    end
  end

  @impl true
  def get_data(name, _last_data) do
    now_unix = SongProvider.now_unix()

    id =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()

    try do
      "https://iris-bob.loverad.io/flow.json?station=#{id}&offset=1&count=1&ts=#{now_unix}"
      |> SongProvider.get()
      |> Map.get(:body)
      |> Jason.decode!()
      |> Map.get("result", %{})
      |> Map.get("entry", %{})
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

      object ->
        case Map.get(object, "song", %{}) |> Map.get("entry", []) |> List.first() do
          nil -> %{}
          song_data ->
            artist = Map.get(song_data, "artist", %{}) |> Map.get("entry", []) |> List.first(%{}) |> Map.get("name")
            picture = Map.get(song_data, "cover_art_url_s")
            title = Map.get(song_data, "title")

            %{
              artist: artist,
              title: title,
              cover_url: picture
            }
        end
    end
  end
end
