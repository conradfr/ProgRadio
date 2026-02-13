defmodule ProgRadioApi.SongProvider.Radiolabelleaventure do
  require Logger
  alias ProgRadioApi.SongProvider

  # this is adapted from azuracast

  @behaviour ProgRadioApi.SongProvider

  @url "https://flux.radiolabelleaventure.com/api/nowplaying/radio_la_belle_aventure"

  @impl true
  def has_custom_refresh(_name), do: true

  @impl true
  def get_refresh(name, data, default_refresh) do
    try do
      now_unix = SongProvider.now_unix()
      end_at = Map.get(data, "played_at", 0) + Map.get(data, "duration", 0)

      if end_at > now_unix do
        next_refresh = end_at - now_unix
        Logger.debug("Data provider - #{name} (radiolabelleaventure) - next refresh: #{next_refresh}")
        next_refresh * 1000
      else
        default_refresh
      end
    rescue
      _ -> default_refresh
    end
  end

  @impl true
  def get_data(name, _last_data) do
    try do
      data =
        @url
        |> SongProvider.get()
        |> Map.get(:body)
        |> :json.decode()
        |> Map.get("now_playing", %{})

      now_unix = SongProvider.now_unix()
      end_at = Map.get(data, "played_at", 0) + Map.get(data, "duration", 0)

      if end_at > now_unix or end_at == 0 do
        data
      else
        nil
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (radiolabelleaventure): data error rescue")
        :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      artist =
        data
        |> Map.get("song", %{})
        |> Map.get("artist")

      title =
        data
        |> Map.get("song", %{})
        |> Map.get("title")

      cover =
        data
        |> Map.get("song", %{})
        |> Map.get("art")

      if artist != nil or title != nil do
        %{
          artist: artist,
          title: title,
          cover_url: cover
        }
      else
        nil
      end
    rescue
      _ ->
        Logger.debug(
          "Data provider - #{name} (radiolabelleaventure): error fetching song data or empty"
        )

        :error
    end
  end
end
