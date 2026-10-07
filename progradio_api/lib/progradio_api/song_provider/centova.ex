defmodule ProgRadioApi.SongProvider.Centova do
  require Logger
  alias ProgRadioApi.SongProvider
  alias ProgRadioApi.SongProvider.Icecast

  @behaviour ProgRadioApi.SongProvider

  # Centova Cast streams are proxied as https://host/proxy/{username}/stream or https://host/proxy/{username}?mp=/stream
  # and the panel has a public json endpoint: https://host/rpc/{username}/streaminfo.get
  @regex ~r/^url:(https?:\/\/[^\/]+)\/+proxy\/([^\/?]+)(?:\?mp=|\/)?([^?;]*)/

  # the url shape is not specific to Centova Cast: the state of icecast.ex when we had to fall back to it
  @icecast_types [:shoutcast, :icecast, :default]

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  # not a Centova Cast (detected on a previous run): we let icecast.ex handle it, with its own state
  @impl true
  def get_data(name, {type, _url, _data} = last_data) when type in @icecast_types,
    do: Icecast.get_data(name, last_data)

  def get_data(name, :indecisive), do: Icecast.get_data(name, :indecisive)

  def get_data(name, _last_data) do
    try do
      [_, base_url, username, mount] = Regex.run(@regex, name)

      case get_stream_info("#{base_url}/rpc/#{username}/streaminfo.get") do
        %{"type" => "result", "data" => [_ | _] = entries} ->
          find_entry(entries, mount)

        _ ->
          Logger.debug("Data provider - #{name} (centova): not centova, using icecast")
          Icecast.get_data(name, nil)
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (centova): data error rescue")
        :error
    catch
      :exit, _ ->
        Logger.debug("Data provider - #{name} (centova): data error catch")
        :error
    end
  end

  @impl true
  def get_song(name, {type, _url, _data} = data, last_song) when type in @icecast_types,
    do: Icecast.get_song(name, data, last_song)

  def get_song(_name, %{"offline" => true}, _last_song), do: nil

  def get_song(name, data, _last_song) do
    try do
      track = Map.get(data, "track") || %{}
      artist = clean(Map.get(track, "artist"))
      title = clean(Map.get(track, "title"))
      raw_song = clean(Map.get(data, "song")) || clean(Map.get(data, "rawmeta"))

      Logger.debug("Data provider - #{name} (centova): data - #{raw_song}")

      cond do
        # we discard suspicious/incomplete entries
        raw_song in SongProvider.get_forbidden_titles() or
            title in SongProvider.get_forbidden_titles() ->
          nil

        artist != nil and title != nil ->
          %{artist: artist, title: title, cover_url: cover_url(Map.get(track, "imageurl"))}

        raw_song != nil ->
          %{artist: raw_song, title: nil, cover_url: cover_url(Map.get(track, "imageurl"))}

        true ->
          nil
      end
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end

  # one entry per mount point: we take the one of the stream url if any, else the first one
  defp find_entry(entries, mount) do
    mount = "/" <> String.trim(mount, "/")

    Enum.find(entries, hd(entries), fn entry ->
      is_map(entry) and Map.get(entry, "mountpoint") == mount
    end)
  end

  # the url may also be a real audio stream on another kind of server: we only read json
  defp get_stream_info(url) do
    case SongProvider.get_maybe_stream(url) do
      %Req.Response{status: 200, headers: %{"content-type" => ["application/json" <> _ | _]}} =
          resp ->
        body = Enum.join(resp.body)
        Req.cancel_async_response(resp)

        case JSON.decode(body) do
          {:ok, data} when is_map(data) -> data
          _ -> nil
        end

      %Req.Response{} = resp ->
        Req.cancel_async_response(resp)
        nil
    end
  end

  defp clean(value) when is_binary(value) do
    case String.trim(value) do
      "" -> nil
      trimmed -> trimmed
    end
  end

  defp clean(_value), do: nil

  # placeholder image when the panel has no cover
  defp cover_url("http" <> _ = image) do
    if String.contains?(image, "nocover"), do: nil, else: image
  end

  defp cover_url(_image), do: nil
end
