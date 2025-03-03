defmodule ProgRadioApi.SongProvider.Radionova do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_name %{
    "radionova_main" => "radio-nova",
    "radionova_danse" => "nova-danse",
    "radionova_hiphop" => "nova-hip-hop",
    "radionova_soul" => "nova-soul",
    "radionova_nouvo" => "nouvo-nova",
    "radionova_reggae" => "nova-reggae",
    "radionova_lanuit" => "nova-la-nuit",
    "radionova_laplage" => "nova-la-plage",
    "radionova_classics" => "nova-classics",
    "radionova_bordeaux" => "nova-bordeaux",
    "radionova_lyon" => "nova-lyon"
  }

  @impl true
  def has_custom_refresh(), do: true

  @impl true
  def get_refresh(_name, nil, default_refresh), do: default_refresh

  @impl true
  def get_refresh(_name, data, _default_refresh) do
    now_unix = SongProvider.now_unix()

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

  @impl true
  def get_data(name, _last_data) do
    try do
      name =
        SongProvider.get_stream_code_name_from_channel(name)
        |> (&Map.get(@stream_name, &1)).()

      radio =
        "https://www.nova.fr/radios-data/www.nova.fr/all.json"
        |> SongProvider.get()
        |> Map.get(:body)
        |> Jason.decode!()
        |> Enum.find(fn r ->
          code =
            r
            |> Map.get("radio", %{})
            |> Map.get("code", nil)

          code == name
        end)

      if radio != nil do
        Map.get(radio, "currentTrack")
      else
        nil
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
        %{
          artist: SongProvider.recase(data["artist"]),
          title: SongProvider.recase(data["title"]),
          cover_url: data["media_url"] || nil
        }
    end
  end
end
