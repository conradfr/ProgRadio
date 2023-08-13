defmodule ProgRadioApi.SongProvider.Virgin do
  require Logger
  alias ProgRadioApi.SongProvider

  #  Radio was renamed Europe2 on 01/01/2023
  #  Keeping old code_name for now

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "virgin_main" => 2,
    "virgin_classics" => 2002,
    "virgin_hits" => 2004,
    "virgin_new" => 2001,
    "virgin_rock" => 2005
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
        "https://direct-radio.rfm.fr/playout?radio=#{id}&limit=1"
        |> SongProvider.get()
        |> Map.get(:body)
        |> Jason.decode!()
        |> Map.get("nowplaying", [])
        |> List.first()

      time_start_naive =
        data
        |> Map.get("time")
        |> NaiveDateTime.from_iso8601!()

      [hours, minutes, seconds] =
        data
        |> Map.get("duration")
        |> String.split(":")

      time_end_unix =
        time_start_naive
        |> NaiveDateTime.add(String.to_integer(hours) * 3600, :second)
        |> NaiveDateTime.add(String.to_integer(minutes) * 60, :second)
        |> NaiveDateTime.add(String.to_integer(seconds), :second)
        # give it some room
        |> NaiveDateTime.add(60, :second)
        |> DateTime.from_naive!("UTC")
        |> DateTime.to_unix()

      time_start_unix =
        time_start_naive
        |> DateTime.from_naive!("UTC")
        |> DateTime.to_unix()

      if time_start_unix < now_unix and time_end_unix > now_unix do
        data
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
        Logger.info("Data provider - #{name}: error fetching song data or empty")
        %{}

      _ ->
        %{artist: SongProvider.recase(data["artist"]), title: SongProvider.recase(data["title"])}
    end
  end
end
