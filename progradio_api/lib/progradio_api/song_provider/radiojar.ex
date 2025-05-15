defmodule ProgRadioApi.SongProvider.Radiojar do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @refresh_auto_interval 10000

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_auto_refresh(), do: @refresh_auto_interval

  @impl true
  def get_data(name, _last_data) do
    try do
      regex = ~r/https:\/\/[a-zA-Z0-9]+\.radiojar\.com\/([a-zA-Z0-9]+)(?:\.mp3)?/

      [_, id] = Regex.run(regex, name)

      case id do
        nil ->
          nil

        _ ->
          now_unix = SongProvider.now_unix()

          "https://proxy.radiojar.com/api/stations/#{id}/now_playing/?t=#{now_unix}"
          |> SongProvider.get()
          |> Map.get(:body)
          |> Jason.decode!()
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (radiojar): data error rescue")
        :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      Logger.debug("Data provider - #{name} (radiojar): data")

      artist =
        case Map.get(data, "artist") do
          nil -> nil
          artist_raw when is_binary(artist_raw) and artist_raw == "" -> nil
          artist_raw when is_binary(artist_raw) -> artist_raw
          _ -> nil
        end

      title =
        case Map.get(data, "title") do
          nil -> nil
          title_raw when is_binary(title_raw) and title_raw == "" -> nil
          title_raw when is_binary(title_raw) -> title_raw
          _ -> nil
        end

      cover =
        case Map.get(data, "thumb") do
          nil -> nil
          cover_raw when is_binary(cover_raw) and cover_raw == "" -> nil
          cover_raw when is_binary(cover_raw) -> cover_raw
          _ -> nil
        end

      %{
        artist: artist,
        title: title,
        cover_url: cover
      }
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (radiojar): song error rescue")
        :error
    end
  end
end
