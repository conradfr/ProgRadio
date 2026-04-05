defmodule ProgRadioApi.SongProvider.Kexp do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @refresh_auto_interval 10000

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_auto_refresh(), do: @refresh_auto_interval

  @impl true
  def get_data(name, _last_data) do
    try do
      date_before =
        DateTime.utc_now()
        |> DateTime.to_iso8601()

      results =
        "https://api.kexp.org/v2/plays/?format=json&limit=1&ordering=-airdate&airdate_before=#{date_before}&playlist_location=3"
        |> SongProvider.get()
        |> Map.get(:body)
        |> :json.decode()
        |> Map.get("results", [])

      case length(results) do
        0 -> nil
        _ -> List.first(results)
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (kexp): data error rescue")
        :error
    end
  end

  @impl true
  def get_song(_name, nil, _last_song), do: nil

  @impl true
  def get_song(_name, :error, _last_song), do: nil

  @impl true
  def get_song(name, data, _last_song) do
    try do
      Logger.debug("Data provider - #{name} (kexp): data")

      %{
        artist: Map.get(data, "artist"),
        title: Map.get(data, "song"),
        cover_url: Map.get(data, "thumbnail_uri")
      }
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (kexp): song error rescue")
        :error
    end
  end
end
