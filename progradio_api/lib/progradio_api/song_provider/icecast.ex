defmodule ProgRadioApi.SongProvider.Icecast do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @refresh_auto_interval 10000

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_auto_refresh(), do: @refresh_auto_interval

  # we try to access metadata urls for shoutcast and icecast
  # and, if successful, set the state for it for repeated operations
  # if none worked we default to the stream metadata (slower)

  # we try to the guess the urls but due to no standards it's prone to error

  # shoutcast was detected on previous run
  @impl true
  def get_data(name, {:shoutcast, url_current_song, _last_data}) do
    Logger.debug("Data provider - #{name} (generic shoutcast/icecast): shoutcast data")

    try do
      case SongProvider.get_maybe_stream(url_current_song) do
        %Req.Response{status: 200, headers: %{"content-type" => ["text/plain;charset=utf-8"]}} =
            resp ->
          body = Enum.join(resp.body)
          Req.cancel_async_response(resp)
          {:shoutcast, url_current_song, body}

        _ ->
          {:shoutcast, url_current_song, :error}
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (generic shoutcast/icecast): shoutcast failed")
        {:shoutcast, url_current_song, :error}
    end
  end

  # icecast was detected on previous run
  @impl true
  def get_data(name, {:icecast, url_status, _last_data}) do
    Logger.debug("Data provider - #{name} (generic shoutcast/icecast): icecast data")

    try do
      case SongProvider.get_maybe_stream(url_status) do
        %Req.Response{
          status: 200,
          headers: %{"content-type" => ["application/json; charset=UTF-8"]}
        } = resp ->
          body = Enum.join(resp.body)
          Req.cancel_async_response(resp)

          song_data =
            body
            |> :json.decode()
            |> Map.get("icestats", %{})
            |> Map.get("source")

          {:icecast, url_status, song_data}

        _ ->
          {:icecast, url_status, :error}
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (generic shoutcast/icecast): icecast failed")
        {:icecast, url_status, :error}
    end
  end

  # both failed on previous run
  @impl true
  def get_data(name, {:default, url, _last_data}) do
    try do
      {:ok, %Shoutcast.Meta{data: data, string: string}} =
        Shoutcast.read_meta(url, follow_redirect: true, pool: false)

      # the shoutcast library doesn't handle all weird icy metadata. If so we'll try to do it ourselves later
      cond do
        is_map(data) and map_size(data) > 0 -> {:default, url, data}
        is_binary(string) and string != "" -> {:default, url, string}
        true -> {:default, url, nil}
      end
    rescue
      _ ->
        Logger.debug(
          "Data provider - #{name} (generic shoutcast/icecast): default data error rescue"
        )

        {:default, url, :error}
    catch
      :exit, _ ->
        Logger.debug(
          "Data provider - #{name} (generic shoutcast/icecast): default data error catch"
        )

        {:default, url, :error}
    end
  end

  # this will be invoked on the first run
  @impl true
  def get_data(name, _last_data) do
    url = SongProvider.get_stream_code_name_from_channel(name)

    result =
      url
      |> get_base_url()
      |> try_shoutcast_and_icecast(name)

    # try shoutcast and icecast or use default
    case result do
      {type, used_url, status_or_data} when status_or_data != :error ->
        {type, used_url, status_or_data}

      _ ->
        get_data(name, {:default, url, nil})
    end
  end

  @impl true
  def get_song(name, {type, _url, data}, _last_song) do
    try do
      case data do
        data when type == :shoutcast ->
          %{
            artist: data,
            title: nil,
            cover_url: nil
          }

        data when type == :icecast ->
          SongProvider.get_song_from_icecast(data)

        data when is_map(data) ->
          song_from_map(name, data)

        data when is_binary(data) ->
          parse_metadata_string(name, data)

        _ ->
          nil
      end
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end

  defp get_base_url(url) when is_binary(url) do
    parsed = URI.parse(url)
    parsed.scheme <> "://" <> parsed.host <> ":" <> Integer.to_string(parsed.port)
  end

  # weird function as elixir does not have "else if"
  defp try_shoutcast_and_icecast(base_url, name) when is_binary(base_url) do
    # first try shoutcast
    {type, url, status_or_data} = get_data(name, {:shoutcast, base_url <> "/currentsong", nil})

    if status_or_data != :error do
      {type, url, status_or_data}
    else
      # otherwise try icecast
      get_data(name, {:icecast, base_url <> "/status-json.xsl", nil})
    end
  end

  defp song_from_map(name, data) do
    key =
      if is_map_key(data, :json) and data.json == true, do: "title", else: "StreamTitle"

    song =
      data
      |> Map.get(key, "")
      |> then(fn
        text when is_binary(text) ->
          Enum.join(for <<c::utf8 <- text>>, do: <<c::utf8>>)

        text when is_list(text) ->
          to_string(text)

        text ->
          text
      end)
      |> String.trim()

    Logger.debug("Data provider - #{name} (generic shoutcast/icecast): data (map) - #{song}")

    # we discard empty or suspicious/incomplete entries
    if is_binary(song) and song != "" and song != "-" and
         String.contains?(song, " - ") === true do
      cover_art =
        data
        |> Map.get("StreamUrl", "")
        |> then(fn
          text when is_binary(text) ->
            Enum.join(for <<c::utf8 <- text>>, do: <<c::utf8>>)

          text when is_list(text) ->
            to_string(text)

          text ->
            text
        end)
        |> String.trim()
        |> then(fn x ->
          case String.ends_with?(x, [".jpg", ".png"]) do
            true -> x
            _ -> nil
          end
        end)

      %{
        artist: song,
        title: nil,
        cover_url: cover_art
      }
    else
      %{}
    end
  end

  defp parse_metadata_string(name, data) do
    regex = ~r/StreamTitle='(?<artist>.*?) - .*?text="(?<title>.*?)" song_spot/

    case Regex.named_captures(regex, data) do
      %{"artist" => artist, "title" => title} ->
        Logger.debug(
          "Data provider - #{name} (generic shoutcast/icecast): data (string) - #{artist} - #{title}"
        )

        %{
          artist: artist,
          title: title,
          cover_url: extract_cover_from_metadata(data)
        }

      nil ->
        case data do
          data when is_binary(data) ->
            %{
              artist: data,
              title: nil,
              cover_url: nil
            }

          _ ->
            nil
        end
    end
  end

  defp extract_cover_from_metadata(data) do
    regex = ~r/amgArtworkURL="(?<artwork_url>http[^"]*)/

    case Regex.named_captures(regex, data) do
      %{"artwork_url" => url} -> url
      nil -> nil
    end
  end
end
