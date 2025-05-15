defmodule ProgRadioApi.SongProvider.GenericRtbs do
  require Logger
  alias ProgRadioApi.SongProvider

  @default_length 300_000

  def has_custom_refresh(), do: true

  def get_refresh(_name, nil, default_refresh), do: default_refresh

  def get_refresh(_name, data, default_refresh) do
    now_unix = SongProvider.now_unix()
    end_unix = get_end_unix(data)

    next =
      case end_unix do
        nil -> nil
        _ -> end_unix - now_unix
      end

    unless next == nil or next < 1 do
      next * 1000
    else
      default_refresh
    end
  end

  def get_data(id, _name, _last_data) do
    now_unix = SongProvider.now_unix()

    try do
      # &rand= is not part of "official" api but it seems to solve their cache problem...
      data =
        "https://www.rtbf.be/radio/liveradio/api/threads.php?key=#{id}&_limit=1&rand=#{:rand.uniform(99)}"
        |> SongProvider.get()
        |> Map.get(:body)
        |> :json.decode()
        |> Map.get("data")
        |> Kernel.hd()

      end_time = get_end_unix(data)

      unless end_time == nil or now_unix > end_time do
        data
      else
        nil
      end
    rescue
      _ -> :error
    end
  end

  def get_song(name, data, _last_song) do
    try do
      %{
        artist: SongProvider.recase(data["artist"]),
        title: SongProvider.recase(data["title"]),
        cover_url: data["image"] || nil
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end

  defp get_end_unix(data) when is_map(data) do
    try do
      timezone =
        data
        |> Map.get("startDate")
        |> Map.get("timezone", "Europe/Brussels")

      duration =
        data
        |> Map.get("duration", @default_length)
        |> Kernel./(1000)
        |> Kernel.round()

      data
      |> Map.get("startDate")
      |> Map.get("date")
      |> NaiveDateTime.from_iso8601!()
      |> DateTime.from_naive!(timezone)
      |> DateTime.to_unix()
      # arbitrary 30 because duration seems too short
      |> Kernel.+(duration + 60)
    rescue
      _ -> nil
    end
  end

  defp get_end_unix(_data), do: nil
end
