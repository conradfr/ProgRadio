defmodule ProgRadioApi.SongProvider.Radiocast do
  require Logger
  alias ProgRadioApi.SongProvider
  alias ProgRadioApi.SongProvider.Icecast

  @behaviour ProgRadioApi.SongProvider

  # radioca.st: one Shoutcast v2 server per subdomain
  # the current song is at the root of the host, whatever the path of the stream
  # ex: https://station.radioca.st/stream, https://station.radioca.st/;, https://station.radioca.st/8203/stream
  @regex ~r/^url:https?:\/\/([^\/:]+\.radioca\.st)(?::\d+)?(?:\/|$)/

  # the state of icecast.ex when we had to fall back to it
  @icecast_types [:shoutcast, :icecast, :default]

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  # no current song endpoint (detected on a previous run): we let icecast.ex handle it, with its own state
  @impl true
  def get_data(name, {type, _url, _data} = last_data) when type in @icecast_types,
    do: Icecast.get_data(name, last_data)

  def get_data(name, :indecisive), do: Icecast.get_data(name, :indecisive)

  def get_data(name, _last_data) do
    try do
      [_, host] = Regex.run(@regex, name)

      case get_current_song("https://#{host}/currentsong") do
        song when is_binary(song) ->
          %{"song" => song}

        nil ->
          Logger.debug("Data provider - #{name} (radioca.st): no current song, using icecast")
          Icecast.get_data(name, nil)
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (radioca.st): data error rescue")
        :error
    catch
      :exit, _ ->
        Logger.debug("Data provider - #{name} (radioca.st): data error catch")
        :error
    end
  end

  @impl true
  def get_song(name, {type, _url, _data} = data, last_song) when type in @icecast_types,
    do: Icecast.get_song(name, data, last_song)

  def get_song(name, data, _last_song) do
    try do
      song =
        case Map.get(data, "song") do
          song when is_binary(song) -> song |> String.replace_invalid("") |> String.trim()
          _ -> ""
        end

      Logger.debug("Data provider - #{name} (radioca.st): data - #{song}")

      # we discard empty or suspicious/incomplete entries
      if song != "" and song not in SongProvider.get_forbidden_titles() do
        %{
          artist: song,
          title: nil,
          cover_url: nil
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

  # plain text only: any other path on these hosts may answer with the audio stream itself
  defp get_current_song(url) do
    case SongProvider.get_maybe_stream(url) do
      %Req.Response{status: 200, headers: %{"content-type" => ["text/plain" <> _ | _]}} = resp ->
        body = Enum.join(resp.body)
        Req.cancel_async_response(resp)
        body

      %Req.Response{} = resp ->
        Req.cancel_async_response(resp)
        nil
    end
  end
end
