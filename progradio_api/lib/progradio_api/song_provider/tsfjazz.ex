defmodule ProgRadioApi.SongProvider.Tsfjazz do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  # delay added to the end of the song so the api has the next one
  @refresh_delay_ms 2000
  @refresh_min_ms 5000

  @impl true
  def has_custom_refresh(_name), do: true

  @impl true
  def get_refresh(name, %{"start_time" => start_time, "duration" => duration}, default_refresh)
      when is_integer(start_time) and is_integer(duration) and duration > 0 do
    next_refresh = (start_time + duration) * 1000 - SongProvider.now_unix(:millisecond)

    if next_refresh > 0 do
      Logger.debug("Data provider - #{name} - next refresh: #{trunc(next_refresh / 1000)}s")
      max(next_refresh + @refresh_delay_ms, @refresh_min_ms)
    else
      # song should be over, the api may lag behind
      default_refresh
    end
  end

  def get_refresh(_name, _data, default_refresh), do: default_refresh

  @impl true
  def get_data(_name, _last_data, _db_song_data) do
    try do
      "https://www.tsfjazz.com/player/qect"
      |> SongProvider.post(%{})
      |> Map.get(:body)
      |> Map.get("current")
    rescue
      _ ->
        nil
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      %{
        artist: SongProvider.recase(Map.get(data, "artist")),
        title: SongProvider.recase(Map.get(data, "title")),
        cover_url: Map.get(data, "cover")
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
