defmodule ProgRadioApi.SongProvider.Radioboss do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  # RadioBOSS Cloud, two kind of urls for the same station:
  # https://c23.radioboss.fm/stream/194 and https://c23.radioboss.fm:8194/stream
  @regex_id ~r/\/\/(c\d+\.radioboss\.fm)\/stream\/(\d+)/
  @regex_port ~r/\/\/(c\d+\.radioboss\.fm):(\d+)\//

  # station id = port - 8000, some ssl ports being 10000 + port
  @port_base 8000
  @port_ssl_offset 10000

  @no_title ["No title info available"]

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    try do
      {host, id} = get_host_and_id(name)

      "https://#{host}/w/nowplayinginfo?u=#{id}"
      |> SongProvider.get_json()
      # kept for the artwork url
      |> Map.put("_host", host)
      |> Map.put("_id", id)
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (radioboss): data error rescue")
        :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      artist = clean(Map.get(data, "currenttrack_artist"))
      title = clean(Map.get(data, "currenttrack_title"))
      now_playing = clean(Map.get(data, "nowplaying"))

      Logger.debug("Data provider - #{name} (radioboss): data - #{now_playing}")

      cond do
        # we discard suspicious/incomplete entries
        now_playing in (@no_title ++ SongProvider.get_forbidden_titles()) or title in @no_title ->
          nil

        artist != nil and title != nil ->
          %{artist: artist, title: title, cover_url: cover_url(data)}

        now_playing != nil ->
          %{artist: now_playing, title: nil, cover_url: cover_url(data)}

        true ->
          nil
      end
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end

  defp get_host_and_id(name) do
    case Regex.run(@regex_id, name) do
      [_, host, id] ->
        {host, id}

      nil ->
        [_, host, port] = Regex.run(@regex_port, name)
        port = String.to_integer(port)
        port = if port >= @port_ssl_offset, do: port - @port_ssl_offset, else: port

        {host, Integer.to_string(port - @port_base)}
    end
  end

  # no timestamp means no artwork (the url would return a placeholder)
  defp cover_url(%{"artwork_ts" => artwork_ts, "_host" => host, "_id" => id})
       when is_integer(artwork_ts) and artwork_ts > 0,
       do: "https://#{host}/w/artwork/#{id}.jpg?#{artwork_ts}"

  defp cover_url(_data), do: nil

  defp clean(value) when is_binary(value) do
    case String.trim(value) do
      "" -> nil
      trimmed -> trimmed
    end
  end

  defp clean(_value), do: nil
end
