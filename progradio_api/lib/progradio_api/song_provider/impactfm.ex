defmodule ProgRadioApi.SongProvider.Impactfm do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  # todo add webradios
  @stream_ids %{
    "impactfm_main" => 61,
  }

  @url "https://api.impactfm.fr/player/getOnAir.php?stream="

  @impl true
  def has_custom_refresh(_name), do: true

  @impl true
  def get_refresh(_name, nil, default_refresh), do: default_refresh

  @impl true
  def get_refresh(_name, data, default_refresh) do
    try do
      now_unix = SongProvider.now_unix()

      {:ok, time_start} =
        data
        |> Map.get("time")
        |> DateTime.from_iso8601()

      duration_raw = Map.get(data, "time")

      {duration_seconds, _} =
        Regex.named_captures(~r/T(?<duration>.*)\+/, duration_raw)
        |> Map.get("duration")
        |> Time.from_iso8601!()
        |> Time.to_seconds_after_midnight()

      next_time =
        time_start
        |> NaiveDateTime.add(duration_seconds, :second)
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

    try do
      data =
        "#{@url}#{id}"
        |> SongProvider.get()
        |> JSON.decode!()
        |> Map.get("result")
        |> Enum.filter(fn r -> Map.get(r, "status") == "playing" end)

      case data do
        playing when playing == [] -> nil
        _ -> hd(data)
      end
    rescue
      _ -> :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      %{
        artist: SongProvider.recase(data["artist"] || nil),
        title: SongProvider.recase(data["title"] || nil),
        cover_url: Map.get(data, "artwork")
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
