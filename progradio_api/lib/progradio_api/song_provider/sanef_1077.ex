defmodule ProgRadioApi.SongProvider.Sanef1077 do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "sanef_1077_main" => 409,
    "sanef_1077_regions" => 500
  }

  @impl true
  def has_custom_refresh(), do: true

  @impl true
  def get_refresh(_name, nil, default_refresh), do: default_refresh

  @impl true
  def get_refresh(_name, data, default_refresh) do
    try do
      now_unix = SongProvider.now_unix()

      time_start_naive =
        data
        |> Map.get("time")
        |> NaiveDateTime.from_iso8601!()

      [hours, minutes, seconds] =
        data
        |> Map.get("duration", 0)
        |> String.split(":")

      next_time =
        time_start_naive
        |> NaiveDateTime.add(String.to_integer(hours) * 3600, :second)
        |> NaiveDateTime.add(String.to_integer(minutes) * 60, :second)
        |> NaiveDateTime.add(String.to_integer(seconds), :second)
        |> DateTime.from_naive!("UTC")
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

  @impl true
  def get_data(name, _last_data) do
    id =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()

    now_unix = SongProvider.now_unix()

    try do
      data =
        "https://radiovis.radio-screen.com/radioscreen-sync/data/#{id}_now_playing.json"
        |> SongProvider.get()
        |> Map.get(:body)
        |> Jason.decode!()
        |> Map.get("nowplaying", [])
        |> List.first()

      {:ok, time_start_naive, _} =
        data
        |> Map.get("time")
        |> DateTime.from_iso8601()

      [hours, minutes, seconds] =
        data
        |> Map.get("duration")
        |> String.split(":")

      time_end_unix =
        time_start_naive
        |> DateTime.add(String.to_integer(hours) * 3600, :second)
        |> DateTime.add(String.to_integer(minutes) * 60, :second)
        |> DateTime.add(String.to_integer(seconds), :second)
        # give it some room
        |> DateTime.add(60, :second)
        |> DateTime.to_unix()

      time_start_unix =
        time_start_naive
        |> DateTime.to_unix()

      if time_start_unix < now_unix and time_end_unix > now_unix do
        data
      else
        nil
      end
    rescue
      _ -> :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      %{artist: SongProvider.recase(data["artist"]), title: SongProvider.recase(data["title"])}
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
