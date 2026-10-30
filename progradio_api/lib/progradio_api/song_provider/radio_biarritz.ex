defmodule ProgRadioApi.SongProvider.RadioBiarritz do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @impl true
  def has_custom_refresh(_name), do: true

  @impl true
  def get_refresh(_name, nil, default_refresh), do: default_refresh

  @impl true
  def get_refresh(_name, data, default_refresh) do
    try do
      now_ms = SongProvider.now_unix() * 1000

      # ts and length are in milliseconds
      end_ms = Map.get(data, "ts") + Map.get(data, "length")

      case end_ms - now_ms do
        next_refresh when next_refresh > 0 -> next_refresh
        _ -> default_refresh
      end
    rescue
      _ -> default_refresh
    end
  end

  @impl true
  def get_data(name, _last_data, _db_song_data) do
    try do
        "https://manager10.streamradio.fr:2190/api/v2/history/?limit=1&offset=0&server=1&format=json"
        |> SongProvider.get_json()
        |> Map.get("results", [])
        |> List.first()
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (rks): data error rescue")
        nil
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      %{
        artist: Map.get(data, "author"),
        title: Map.get(data, "title"),
        cover_url: Map.get(data, "img_medium_url") || Map.get(data, "img_url")
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
