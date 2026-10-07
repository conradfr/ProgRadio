defmodule ProgRadioApi.SongProvider.Azuracast do
  require Logger
  alias ProgRadioApi.SongProvider
  alias ProgRadioApi.SongProvider.Icecast

  @behaviour ProgRadioApi.SongProvider

  @refresh_auto_interval 7500
  # the "refresh on song end" loop has no use when we fall back to the stream metadata
  @refresh_fallback_interval 600_000

  @impl true
  def has_custom_refresh(_name), do: true

  @impl true
  def get_refresh(_name, {:not_azuracast, _url, _data}, _default_refresh),
    do: @refresh_fallback_interval

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

  # the url looked like an azuracast one but the api did not answer as such on a previous run:
  # we use the stream metadata (as icecast.ex)
  @impl true
  def get_data(name, {:not_azuracast, url, last_data}) do
    {_type, final_url, data} = Icecast.get_data(name, {:default, url, last_data})

    {:not_azuracast, final_url, data}
  end

  def get_data(name, _last_data) do
    try do
      regex =
        ~r/^url:(.*?)\/listen\/([^\/]*)(?:\/.*)?$/

      [_, url, id] = Regex.run(regex, name)

      case id do
        nil ->
          nil

        _ ->
          # network errors raise (-> :error, we will retry), any answer that is not the api one means not azuracast
          case "#{url}/api/nowplaying/#{id}" |> SongProvider.get() |> JSON.decode() do
            {:ok, %{"now_playing" => now_playing}} ->
              data = now_playing || %{}

              now_unix = SongProvider.now_unix()
              end_at = Map.get(data, "played_at", 0) + Map.get(data, "duration", 0)

              if end_at > now_unix or end_at == 0 do
                data
              else
                nil
              end

            _ ->
              Logger.debug(
                "Data provider - #{name} (azuracast): not azuracast, using stream metadata"
              )

              get_data(
                name,
                {:not_azuracast, SongProvider.get_stream_code_name_from_channel(name), nil}
              )
          end
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (azuracast): data error rescue")
        :error
    end
  end

  @impl true
  def get_song(name, {:not_azuracast, url, data}, last_song) do
    Icecast.get_song(name, {:default, url, data}, last_song)
  end

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
