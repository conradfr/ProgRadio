defmodule ProgRadioApi.SongProvider.Live365 do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @regex ~r/live365[^\/]*\/(a\d+)/

  # delay added to the end of the song so the api has the next one
  @refresh_delay_ms 2000
  @refresh_min_ms 5000

  # a song ended for longer than that is considered as not up to date
  @max_delta_seconds 600

  @impl true
  def has_custom_refresh(_name), do: true

  @impl true
  def get_refresh(name, data, _default_refresh) do
    with %{} = track <- current_track(data),
         end_at when is_integer(end_at) <- to_unix_ms(Map.get(track, "end")),
         next_refresh when next_refresh > 0 <- end_at - SongProvider.now_unix(:millisecond) do
      Logger.debug(
        "Data provider - #{name} (live365) - next refresh: #{trunc(next_refresh / 1000)}s"
      )

      max(next_refresh + @refresh_delay_ms, @refresh_min_ms)
    else
      _ -> nil
    end
  end

  @impl true
  def get_data(name, _last_data) do
    try do
      [_, id] = Regex.run(@regex, name)

      "https://api.live365.com/station/#{id}"
      |> SongProvider.get_json()
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (live365): data error rescue")
        :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      with true <- Map.get(data, "is_playing") == true,
           %{} = track <- current_track(data),
           false <- outdated?(track) do
        artist = clean(Map.get(track, "artist"))
        title = clean(Map.get(track, "title"))

        Logger.debug("Data provider - #{name} (live365): data - #{artist} - #{title}")

        if artist != nil or title != nil do
          %{
            artist: artist,
            title: title,
            cover_url: clean(Map.get(track, "art"))
          }
        else
          nil
        end
      else
        _ -> nil
      end
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end

  # no current track when a live dj is on
  defp current_track(%{"current-track" => %{} = track}) when map_size(track) > 0, do: track
  defp current_track(_data), do: nil

  # only for songs with a known duration
  defp outdated?(%{"duration" => duration, "end" => end_at})
       when is_number(duration) and duration > 0 do
    case to_unix_ms(end_at) do
      nil -> false
      end_ms -> SongProvider.now_unix(:millisecond) > end_ms + @max_delta_seconds * 1000
    end
  end

  defp outdated?(_track), do: false

  # ex: "2026-10-07 09:26:41.67+00:00"
  defp to_unix_ms(date) when is_binary(date) do
    case date |> String.replace(" ", "T", global: false) |> DateTime.from_iso8601() do
      {:ok, datetime, _offset} -> DateTime.to_unix(datetime, :millisecond)
      _ -> nil
    end
  end

  defp to_unix_ms(_date), do: nil

  defp clean(value) when is_binary(value) do
    case String.trim(value) do
      "" -> nil
      trimmed -> trimmed
    end
  end

  defp clean(_value), do: nil
end
