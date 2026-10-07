defmodule ProgRadioApi.SongProvider.Twostream do
  require Logger
  alias ProgRadioApi.SongProvider
  alias ProgRadioApi.SongProvider.Icecast

  @behaviour ProgRadioApi.SongProvider

  # 2stream.net is one Icecast server behind several hosts (2stream.net, go.2stream.net, live.2stream.net)
  # its status has all the public mounts, so one (cached) request is shared by all the streams
  # ex: https://go.2stream.net/kizrock
  @regex ~r/2stream\.net(?::\d+)?\/([^\/?]+)/
  @status_url "https://go.2stream.net/status-json.xsl"
  @cache_ttl_seconds 10

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, last_data) do
    try do
      [_, mount] = Regex.run(@regex, name)

      case find_source(mount) do
        %{} = source ->
          source

        # some mounts are not in the status: we use the stream metadata (as icecast.ex)
        nil ->
          Logger.debug("Data provider - #{name} (2stream): mount not in status, using icecast")
          Icecast.get_data(name, {:default, stream_url(name, last_data), nil})
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (2stream): data error rescue")
        :error
    catch
      :exit, _ ->
        Logger.debug("Data provider - #{name} (2stream): data error catch")
        :error
    end
  end

  @impl true
  def get_song(name, {:default, _url, _data} = data, last_song),
    do: Icecast.get_song(name, data, last_song)

  def get_song(name, data, _last_song) do
    try do
      # "title" is the current song, "yp_currently_playing" is not up to date
      song =
        case Map.get(data, "title") do
          title when is_binary(title) -> String.trim(title)
          _ -> ""
        end

      Logger.debug("Data provider - #{name} (2stream): data - #{song}")

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

  # the listenurl is on another host/port than the stream url: we only compare the mount
  defp find_source(mount) do
    @status_url
    |> SongProvider.get_json_cached(@cache_ttl_seconds)
    |> Map.get("icestats", %{})
    |> Map.get("source")
    |> List.wrap()
    |> Enum.find(fn source ->
      is_map(source) and String.ends_with?(Map.get(source, "listenurl") || "", "/" <> mount)
    end)
  end

  # final url (after redirects) of the previous run if any
  defp stream_url(_name, {:default, url, _data}) when is_binary(url), do: url
  defp stream_url(name, _last_data), do: SongProvider.get_stream_code_name_from_channel(name)
end
