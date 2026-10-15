defmodule ProgRadioApi.SongProvider.Cdnstream1 do
  require Logger
  alias ProgRadioApi.SongProvider
  alias ProgRadioApi.SongProvider.Icecast

  @behaviour ProgRadioApi.SongProvider

  @refresh_auto_interval 10000

  # streams are https://{host}.cdnstream1.com/{mount}[.aac|.mp3] with mount as {station id}_{bitrate}[k]
  # (also on cdnstream.com and streamon.fm, same platform and metadata url)
  # some stations (not predictable from the url) have their metadata at
  # https://yp.cdnstream1.com/metadata/{mount}/current.json, the others return a 404
  @regex ~r/\.(?:cdnstream1?\.com|streamon\.fm)\/(\d+_\d+k?)(?:\.aac|\.mp3)?(?:[?;]|$)/

  # last_seen is refreshed while the song plays: older means the station stopped sending metadata
  @stale_after_seconds 600

  # no metadata url for this station (404 on a previous run): the state of icecast.ex (reading the stream metadata)
  @icecast_types [:shoutcast, :icecast, :default]

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_auto_refresh(), do: @refresh_auto_interval

  @impl true
  def get_data(name, {type, _url, _data} = last_data, db_song_data) when type in @icecast_types,
    do: Icecast.get_data(name, last_data, db_song_data)

  def get_data(name, :indecisive, db_song_data),
    do: Icecast.get_data(name, :indecisive, db_song_data)

  def get_data(name, _last_data, db_song_data) do
    try do
      [_, mount] = Regex.run(@regex, name)

      case SongProvider.get_response("https://yp.cdnstream1.com/metadata/#{mount}/current.json") do
        %Req.Response{status: 200, body: body} ->
          case JSON.decode!(body) do
            [entry | _] when is_map(entry) -> entry
            _ -> nil
          end

        # only a 404 is definitive, other errors are retried on the next run
        %Req.Response{status: 404} ->
          Logger.debug("Data provider - #{name} (cdnstream1): no metadata url, using icecast")
          Icecast.get_data(name, nil, db_song_data)

        _ ->
          :error
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (cdnstream1): data error rescue")
        :error
    catch
      :exit, _ ->
        Logger.debug("Data provider - #{name} (cdnstream1): data error catch")
        :error
    end
  end

  @impl true
  def get_song(name, {type, _url, _data} = data, last_song) when type in @icecast_types,
    do: Icecast.get_song(name, data, last_song)

  def get_song(name, data, _last_song) do
    try do
      artist = clean(Map.get(data, "TPE1"))
      title = clean(Map.get(data, "TIT2"))
      last_seen = Map.get(data, "last_seen")

      Logger.debug("Data provider - #{name} (cdnstream1): data - #{artist} - #{title}")

      cond do
        is_number(last_seen) and SongProvider.now_unix() - last_seen > @stale_after_seconds ->
          nil

        # we discard suspicious/incomplete entries
        artist in SongProvider.get_forbidden_titles() or
            title in SongProvider.get_forbidden_titles() ->
          nil

        artist != nil and title != nil ->
          %{artist: artist, title: title, cover_url: cover_url(Map.get(data, "WXXX_album_art"))}

        artist != nil or title != nil ->
          %{
            artist: artist || title,
            title: nil,
            cover_url: cover_url(Map.get(data, "WXXX_album_art"))
          }

        true ->
          nil
      end
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end

  defp clean(value) when is_binary(value) do
    case String.trim(value) do
      "" -> nil
      trimmed -> trimmed
    end
  end

  defp clean(_value), do: nil

  # can be prefixed, as "picture=https://..."
  defp cover_url(value) when is_binary(value) do
    case value |> String.trim() |> String.replace_prefix("picture=", "") do
      "http" <> _ = url -> url
      _ -> nil
    end
  end

  defp cover_url(_value), do: nil
end
