defmodule ProgRadioApi.SongProvider.Icecast do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @refresh_auto_interval 10000

  # duplicated in song_provider.ex
  @forbidden_titles [
    "nodesc",
    "Unknown - Unknown",
    " - ",
    "-",
    "DJ Mike Llama - Llama Whippin' Intro",
    "Stream not found",
    "Now Playing info goes here",
    "Dj Online"
  ]

  @impl true
  def has_custom_refresh(_name), do: false

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
            |> JSON.decode!()
            |> Map.get("icestats", %{})
            |> Map.get("source")

          {:icecast, url_status, song_data}

        #        %Req.Response{
        #          status: 200,
        #          headers: %{"content-type" => ["text/html"]}
        #        } = resp ->
        #          body = Enum.join(resp.body)
        #          Req.cancel_async_response(resp)
        #
        #          song_data =
        #            body
        #            |> JSON.decode!()
        #            |> Map.get("icestats", %{})
        #            |> Map.get("source")
        #
        #          {:icecast, url_status, song_data}

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
      case Shoutcast.read_meta(url, follow_redirect: true, insecure: true, pool: false) do
        {:error, e} ->
          {:default, url, nil}

        {:ok, %Shoutcast.Meta{data: data, string: string, location: final_location}} ->
          # the shoutcast library doesn't handle all weird icy metadata. If so we'll try to do it ourselves later
          cond do
            is_map(data) and map_size(data) > 0 -> {:default, final_location, data}
            is_binary(string) and string != "" -> {:default, final_location, string}
            true -> {:default, final_location || url, nil}
          end
      end
    rescue
      e ->
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

  @impl true
  def get_data(name, :indecisive) do
    url = SongProvider.get_stream_code_name_from_channel(name)
    get_data(name, {:default, url, nil})
  end

  # this will be invoked on the first run
  @impl true
  def get_data(name, _last_data) do
    url = SongProvider.get_stream_code_name_from_channel(name)

    # try shoutcast and icecast or use default
    case try_shoutcast_and_icecast(url, name) do
      {type, used_url, status_or_data} when status_or_data != :error ->
        {type, used_url, status_or_data}

      _ ->
        get_data(name, {:default, url, nil})
    end
  end

  @impl true
  def get_song(name, {type, _url, data} = params, _last_song) do
    try do
      case data do
        data when type in [:shoutcast, :icecast] ->
          get_song_from_shoutcast_or_icecast(params, name, "icecast")

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

  defp try_shoutcast_and_icecast(url, name) do
    relevant_url_part = String.replace(url, ~r{^https?://}, "")
    # first trying the most common combination
    steps =
      cond do
        String.contains?(relevant_url_part, "/live") ->
          [{:icecast, get_icecast_url(url)}]

        String.contains?(relevant_url_part, "/stream") ->
          [{:shoutcast, get_shoutcast_url(url)}]

        true ->
          base_url = get_base_url(url)

          [
            {:icecast, base_url <> "/status-json.xsl"},
            {:shoutcast, base_url <> "/currentsong"}
          ]
      end

    Enum.find_value(steps, fn {type, step_url} ->
      case get_data(name, {type, step_url, nil}) do
        {_, _, :error} -> nil
        result -> result
      end
    end)
  end

  def get_shoutcast_url(url) do
    url
    |> String.split("/stream")
    |> hd()
    |> Kernel.<>("/currentsong")
  end

  def get_icecast_url(url) do
    url
    |> String.split("/live")
    |> hd()
    |> Kernel.<>("/status-json.xsl")
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
    if is_binary(song) and song != "" and
         song not in @forbidden_titles do
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

  @spec get_song_from_shoutcast_or_icecast(tuple | atom() | nil, String.t(), String.t()) ::
          map | nil

  defp get_song_from_shoutcast_or_icecast(data, url, name)

  defp get_song_from_shoutcast_or_icecast(nil, _url, _name), do: nil
  defp get_song_from_shoutcast_or_icecast(:error, _url, _name), do: nil

  defp get_song_from_shoutcast_or_icecast({_type, _url_status, data}, url, name)
       when is_binary(data) do
    Logger.debug("Data provider - #{url} (#{name}): song")

    try do
      if data != "" and String.contains?(data, "Error 404") == false and
           Enum.member?(@forbidden_titles, data) == false do
        %{
          artist: data,
          title: nil,
          cover_url: nil
        }
      else
        nil
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{url} (#{name}): song error rescue")
        :error
    end
  end

  defp get_song_from_shoutcast_or_icecast({_type, _url_status, data}, url, name)
       when is_map(data) or is_list(data) do
    # we delegate to the specific icecast function
    case get_song_from_icecast(data, url) do
      :indecisive ->
        :indecisive

      nil ->
        nil

      %{artist: nil} = song ->
        nil

      %{artist: artist} = song when is_binary(artist) and artist != "" ->
        if Enum.member?(@forbidden_titles, artist) == false, do: song, else: nil

      song ->
        song
    end
  end

  defp get_song_from_shoutcast_or_icecast({_type, _url_status, _data}, _url, _name), do: nil

  defp get_song_from_icecast(data, url, name) do
    try do
      Logger.debug("Data provider - #{url} (#{name}): song")
      get_song_from_icecast(data, url)
    rescue
      _ ->
        Logger.debug("Data provider - #{url} (#{name}): song error rescue")
        :error
    end
  end

  @spec get_song_from_icecast(map | list, String.t()) :: String.t() | nil

  defp get_song_from_icecast(data, url) when is_list(data) do
    basic_url =
      url
      |> String.split("url:")
      |> List.last()
      |> String.replace(~r{^https?://}, "")
      |> String.split("?")
      |> List.first()

    # we try to find the relevant entry if multiple by comparing urls
    # it's a bit fickle because of https / http stream (with port), redirect etc
    # if fail we took the first one

    data
    |> Enum.filter(fn e ->
      is_map_key(e, "title") or is_map_key(e, "yp_currently_playing")
    end)
    |> then(fn entries ->
      Enum.find_value(entries, fn e ->
        if Map.get(e, "listenurl") != nil and String.contains?(Map.get(e, "listenurl"), basic_url) do
          get_song_from_icecast(e, url)
        end
      end) ||
        case entries do
          entries when length(entries) > 1 -> :indecisive
          _ -> Enum.find_value(entries, fn e -> get_song_from_icecast(e, url) end)
        end
    end)
  end

  defp get_song_from_icecast(%{"yp_currently_playing" => artist_title} = _data, _url)
       when is_binary(artist_title),
       do: %{artist: artist_title, title: nil, cover_url: nil}

  defp get_song_from_icecast(%{"artist" => "", "title" => title} = _data, _url)
       when is_binary(title),
       do: %{artist: title, title: nil, cover_url: nil}

  defp get_song_from_icecast(%{artist: artist, title: title} = _data, _url)
       when is_binary(artist) and is_binary(title),
       do: %{artist: artist, title: title, cover_url: nil}

  defp get_song_from_icecast(%{"title" => artist_title} = _data, _url)
       when is_binary(artist_title),
       do: %{artist: artist_title, title: nil, cover_url: nil}

  defp get_song_from_icecast(_data, _url), do: nil

  defp get_base_url(url) when is_binary(url) do
    parsed = URI.parse(url)
    parsed.scheme <> "://" <> parsed.host <> ":" <> Integer.to_string(parsed.port)
  end

  defp parse_metadata_string(name, data) do
    regex = ~r/StreamTitle='(?<artist>.*?) - .*?text="(?<title>.*?)" song_spot/

    case Regex.named_captures(regex, data) do
      %{"artist" => "", "title" => ""} ->
        Logger.debug(
          "Data provider - #{name} (generic shoutcast/icecast): data (string) - Empty data"
        )

        nil

      %{"artist" => artist} when artist in @forbidden_titles ->
        Logger.debug(
          "Data provider - #{name} (generic shoutcast/icecast): data (string) - Forbidden string"
        )

        nil

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
