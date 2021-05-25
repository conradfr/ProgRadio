defmodule ProgRadioApi.SongProvider.Skyrock do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @url "https://skyrock.fm/api/v3/player/onair/parisidf"
  @radio_lag 5

  @impl true
  def has_custom_refresh(), do: true

  @impl true
  def get_auto_refresh(_name, nil, default_refresh), do: default_refresh

  @impl true
  def get_refresh(_name, _data, default_refresh), do: default_refresh

  @impl true
  def get_refresh(_name, data, default_refresh) do
    try do
      now_unix = SongProvider.now_unix()

      next = (Map.get(data["info"], "end_ts") |> String.to_integer()) + @radio_lag - now_unix

      if now_unix + next < now_unix do
        default_refresh
      else
        next * 1000
      end
    rescue
      _ -> default_refresh
    end
  end

  @impl true
  def get_data(_name, _last_data) do
    now_unix = SongProvider.now_unix()

    @url
    |> SongProvider.get()
    |> Map.get(:body)
    |> Jason.decode!()
    |> Map.get("schedule", [])
    |> Enum.find(nil, fn e ->
      time_start =
        e
        |> Map.get("info", %{})
        |> Map.get("start_ts", 0)
        |> String.to_integer()

      time_end =
        e
        |> Map.get("info", %{})
        |> Map.get("end_ts", 0)
        |> String.to_integer()

      now_unix >= time_start and now_unix <= time_end
    end)
  end

  @impl true
  def get_song(name, data) do
    case data do
      nil ->
        Logger.info("Data provider - #{name}: error fetching song data or empty")
        %{}

      _ ->
        artist =
          data["artists"]
          |> List.first()
          |> Map.get("name")

        %{artist: artist, title: data["info"]["title"]}
    end
  end
end
