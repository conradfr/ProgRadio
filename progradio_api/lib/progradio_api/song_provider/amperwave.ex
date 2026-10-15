defmodule ProgRadioApi.SongProvider.Amperwave do
  require Logger

  alias ProgRadioApi.SongProvider
  alias ProgRadioApi.SongProvider.{Hls, Icecast}

  @behaviour ProgRadioApi.SongProvider

  # same as icecast.ex and hls.ex, the ones used without the station id
  @refresh_auto_interval 10000

  # only the start of the song is given: older means the station stopped sending them (talk, ads)
  @stale_after_seconds 900

  @icecast_types [:shoutcast, :icecast, :default]

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_auto_refresh(), do: @refresh_auto_interval

  # the station id of the now playing api is the mobileId of the station website, added to the song data
  # of the stream by the importers (see Importer.StreamEnhancer)
  @impl true
  def get_data(name, _last_data, %{"amperwave_mobile_id" => mobile_id})
      when is_binary(mobile_id) and mobile_id != "" do
    try do
      "https://api-nowplaying.amperwave.net/api/v1/prtplus/nowplaying/1/#{mobile_id}/nowplaying.json"
      |> SongProvider.get_json()
      |> case do
        %{"performances" => [performance | _]} when is_map(performance) -> performance
        # unknown id: "performances" is null
        _ -> nil
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (amperwave): data error rescue")
        :error
    catch
      :exit, _ ->
        Logger.debug("Data provider - #{name} (amperwave): data error catch")
        :error
    end
  end

  # without the station id we read the metadata of the stream itself
  def get_data(name, last_data, db_song_data) do
    if String.contains?(name, ".m3u8"),
      do: Hls.get_data(name, last_data, db_song_data),
      else: Icecast.get_data(name, last_data, db_song_data)
  end

  @impl true
  def get_song(name, {type, _url, _data} = data, last_song) when type in @icecast_types,
    do: Icecast.get_song(name, data, last_song)

  # parsed playlist (atom keys), a performance has string keys
  def get_song(name, %{lines: _lines} = data, last_song),
    do: Hls.get_song(name, data, last_song)

  def get_song(name, performance, _last_song) when is_map(performance) do
    try do
      artist = clean(Map.get(performance, "artist"))
      title = clean(Map.get(performance, "title"))

      Logger.debug("Data provider - #{name} (amperwave): data - #{artist} - #{title}")

      cond do
        stale?(Map.get(performance, "time")) ->
          nil

        # we discard suspicious/incomplete entries
        artist in SongProvider.get_forbidden_titles() or
            title in SongProvider.get_forbidden_titles() ->
          nil

        artist != nil and title != nil ->
          %{artist: artist, title: title, cover_url: cover_url(performance)}

        # shows and segments have no artist
        artist != nil or title != nil ->
          %{artist: artist || title, title: nil, cover_url: cover_url(performance)}

        true ->
          nil
      end
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end

  def get_song(_name, _data, _last_song), do: nil

  # ----- utils -----

  defp stale?(time) when is_binary(time) do
    case DateTime.from_iso8601(time) do
      {:ok, datetime, _offset} ->
        SongProvider.now_unix() - DateTime.to_unix(datetime) > @stale_after_seconds

      _ ->
        false
    end
  end

  defp stale?(_time), do: false

  defp clean(value) when is_binary(value) do
    case String.trim(value) do
      "" -> nil
      trimmed -> trimmed
    end
  end

  defp clean(_value), do: nil

  # empty when there is none
  defp cover_url(performance) do
    image =
      clean(Map.get(performance, "largeimage")) || clean(Map.get(performance, "mediumimage"))

    case image do
      "http" <> _ = url -> url
      _ -> nil
    end
  end
end
