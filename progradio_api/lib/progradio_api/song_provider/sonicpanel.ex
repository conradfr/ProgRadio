defmodule ProgRadioApi.SongProvider.Sonicpanel do
  require Logger
  alias ProgRadioApi.SongProvider
  alias ProgRadioApi.SongProvider.Icecast

  @behaviour ProgRadioApi.SongProvider

  # SonicPanel streams are proxied as https://host/{port}/stream
  # and the panel has a public json endpoint ("Json output (PHP - API)"): https://host/cp/get_info.php?p={port}
  @regex ~r/^url:(https?:\/\/[^\/]+)\/(\d{4,5})(?:\/|$)/

  # the url shape is not specific to SonicPanel: the state of icecast.ex when we had to fall back to it
  @icecast_types [:shoutcast, :icecast, :default]

  @offline_titles ["Radio Offline", "Offline"]

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  # not a SonicPanel (detected on a previous run): we let icecast.ex handle it, with its own state
  @impl true
  def get_data(name, {type, _url, _data} = last_data) when type in @icecast_types,
    do: Icecast.get_data(name, last_data)

  def get_data(name, :indecisive), do: Icecast.get_data(name, :indecisive)

  def get_data(name, _last_data) do
    try do
      [_, base_url, port] = Regex.run(@regex, name)

      case get_info("#{base_url}/cp/get_info.php?p=#{port}") do
        %{"title" => _} = data ->
          data

        _ ->
          Logger.debug("Data provider - #{name} (sonicpanel): not sonicpanel, using icecast")
          Icecast.get_data(name, nil)
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (sonicpanel): data error rescue")
        :error
    catch
      :exit, _ ->
        Logger.debug("Data provider - #{name} (sonicpanel): data error catch")
        :error
    end
  end

  @impl true
  def get_song(name, {type, _url, _data} = data, last_song) when type in @icecast_types,
    do: Icecast.get_song(name, data, last_song)

  def get_song(name, data, _last_song) do
    try do
      song =
        case Map.get(data, "title") do
          title when is_binary(title) -> String.trim(title)
          _ -> ""
        end

      Logger.debug("Data provider - #{name} (sonicpanel): data - #{song}")

      # we discard empty or suspicious/incomplete entries
      if song != "" and song not in @offline_titles and
           song not in SongProvider.get_forbidden_titles() do
        %{
          artist: song,
          title: nil,
          cover_url: cover_url(Map.get(data, "art"))
        }
      else
        nil
      end
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end

  # the url may also be a real audio stream on another kind of server: we only read json (or html, sent by some panels)
  defp get_info(url) do
    case SongProvider.get_maybe_stream(url) do
      %Req.Response{status: 200, headers: %{"content-type" => [content_type | _]}} = resp ->
        if String.starts_with?(content_type, ["application/json", "text/html"]) do
          body = Enum.join(resp.body)
          Req.cancel_async_response(resp)

          case JSON.decode(body) do
            {:ok, data} when is_map(data) -> data
            _ -> nil
          end
        else
          Req.cancel_async_response(resp)
          nil
        end

      %Req.Response{} = resp ->
        Req.cancel_async_response(resp)
        nil
    end
  end

  # placeholder image when the panel has no cover
  defp cover_url("http" <> _ = art) do
    if String.contains?(art, "nocover"), do: nil, else: art
  end

  defp cover_url(_art), do: nil
end
