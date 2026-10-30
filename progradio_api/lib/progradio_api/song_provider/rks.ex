defmodule ProgRadioApi.SongProvider.Rks do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @refresh_auto_interval 5000
  # 10 mn
  @max_delta_seconds 600

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_auto_refresh(), do: @refresh_auto_interval

  @impl true
  def get_data(name, _last_data, _db_song_data) do
    try do
      data =
        "https://radiorks.com/_srp/ten/history"
        |> SongProvider.get_json()
        |> Map.get("results", [])
        |> List.first()

      with %{"ts" => ts} <- data,
           {:ok, ts_datetime, _offset} <- DateTime.from_iso8601(ts),
           delta when delta >= 0 and delta <= @max_delta_seconds <-
             SongProvider.now_unix() - DateTime.to_unix(ts_datetime) do
        data
      else
        _ -> nil
      end
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
        cover_url: Map.get(data, "img_url")
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
