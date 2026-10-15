defmodule ProgRadioApi.SongProvider.Ru101 do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  # 101.ru channels, streams are https://{host}.101.ru[:port]/stream/{kind}/{codec}/{bitrate}/{channel id}
  # pro, trust and air ids are the ones of the site channels (101.ru/radio/channel/{id})
  # their stream metadata is empty or bogus, the site gets it from its websocket or this api
  # personal channels (user ones) are only on the websocket
  @regex ~r/101\.ru(?::\d+)?\/stream\/(?:pro|trust|air)\/[^\/]+\/\d+\/(\d+)(?:[?\/]|$)/

  # the api gives the seconds left of the song (lastTime), we cap it in case of a skipped or long one
  @refresh_max 300_000
  @refresh_margin 2_000

  @impl true
  def has_custom_refresh(_name), do: true

  @impl true
  def get_refresh(_name, nil, default_refresh), do: default_refresh

  @impl true
  def get_refresh(_name, data, default_refresh) do
    try do
      case get_in(data, ["stat", "lastTime"]) do
        seconds_left when is_integer(seconds_left) and seconds_left > 0 ->
          min(seconds_left * 1000 + @refresh_margin, @refresh_max)

        _ ->
          default_refresh
      end
    rescue
      _ -> default_refresh
    end
  end

  @impl true
  def get_data(name, _last_data) do
    try do
      [_, channel_id] = Regex.run(@regex, name)

      "https://101.ru/api/channel/getTrackOnAir/#{channel_id}/channelchannel/?dataFormat=json"
      |> SongProvider.get_json()
      |> case do
        %{"status" => 1, "result" => %{"short" => short} = result} when is_map(short) ->
          result

        # no data on the track (code 204), some channels have it only on the websocket
        _ ->
          nil
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (101.ru): data error rescue")
        :error
    catch
      :exit, _ ->
        Logger.debug("Data provider - #{name} (101.ru): data error catch")
        :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      short = Map.get(data, "short")
      artist =
        clean(Map.get(short, "titleExecutorFull")) || clean(Map.get(short, "titleExecutor"))
      title = clean(Map.get(short, "titleTrack"))
      # "artist - title" in one field
      full_title = clean(Map.get(short, "title"))

      Logger.debug("Data provider - #{name} (101.ru): data - #{artist} - #{title}")

      cond do
        Map.get(short, "advertising") not in [0, false, nil] ->
          nil

        # we discard suspicious/incomplete entries
        artist in SongProvider.get_forbidden_titles() or
            title in SongProvider.get_forbidden_titles() ->
          nil

        artist != nil and title != nil ->
          %{artist: artist, title: title, cover_url: cover_url(Map.get(short, "cover"))}

        full_title != nil ->
          %{artist: full_title, title: nil, cover_url: cover_url(Map.get(short, "cover"))}

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

  # false when there is none
  defp cover_url(%{} = cover) do
    case Map.get(cover, "cover300") || Map.get(cover, "coverHTTP") do
      "http" <> _ = url -> url
      _ -> nil
    end
  end

  defp cover_url(_cover), do: nil
end
