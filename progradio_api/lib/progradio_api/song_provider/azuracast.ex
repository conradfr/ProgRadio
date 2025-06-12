defmodule ProgRadioApi.SongProvider.Azuracast do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @refresh_auto_interval 7500

  @impl true
  def has_custom_refresh(), do: true

  @impl true
  def get_refresh(name, data, _default_refresh) do
    try do
      now_unix = SongProvider.now_unix()
      end_at = Map.get(data, "played_at", 0) + Map.get(data, "duration", 0)

      if end_at > now_unix do
        next_refresh = end_at - now_unix
        Logger.debug("Data provider - #{name} (azuracast) - next refresh: #{next_refresh}")
        next_refresh * 1000
      else
        @refresh_auto_interval
      end
    rescue
      _ -> @refresh_auto_interval
    end
  end

  @impl true
  def get_auto_refresh(), do: @refresh_auto_interval

  @impl true
  def get_data(name, _last_data) do
    try do
      regex =
        ~r/^url:(.*?)\/listen\/([^\/]*)(?:\/.*)?$/

      [_, url, id] = Regex.run(regex, name)

      case id do
        nil ->
          nil

        _ ->
          data =
            "#{url}/api/nowplaying/#{id}"
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
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (azuracast): data error rescue")
        :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      Logger.debug("Data provider - #{name} (azuracast): song")

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
        Logger.debug("Data provider - #{name} (azuracast): song error rescue")
        :error
    end
  end
end
