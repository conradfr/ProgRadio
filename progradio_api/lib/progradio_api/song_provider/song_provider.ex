defmodule ProgRadioApi.SongProvider do
  require Logger

  @doc """
    Get next song refresh in seconds
  """
  @callback get_refresh(String.t(), map() | nil, integer()) :: integer() | nil

  @doc """
    Get source data as a map
  """
  @callback get_data(String.t(), map() | nil) :: map() | nil

  @doc """
    Get artist and song as a map
  """
  @callback get_song(String.t(), map() | tuple() | nil, map() | nil) :: map() | nil

  @doc """
    Indicates if it can refresh based on metadata or not
  """
  @callback has_custom_refresh(String.t()) :: boolean()

  @doc """
    Overrides the default auto refresh rate
  """
  @callback get_auto_refresh() :: integer()

  @optional_callbacks get_auto_refresh: 0

  # ----- Utils -----

  @timeout 5_000

  # duplicated in icecast.ex
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

  def get(url) do
    HTTPoison.get!(
      url,
      [{"Cache-Control", "no-cache"}, {"Pragma", "no-cache"}],
      hackney: [:insecure],
      timeout: @timeout,
      recv_timeout: @timeout,
      follow_redirect: true
    )
    |> Map.get(:body)
  end

  # for when we have url that may be audio streams and won't return on a normal get
  def get_maybe_stream(url) do
    Req.get!(
      url,
      retry: false,
      redirect: true,
      max_redirects: 2,
      into: :self
    )
  end

  def post(url, body) do
    Req.post!(
      url,
      body: body,
      headers: [{"Cache-Control", "no-cache"}],
      redirect: false,
      connect_options: [timeout: 15_000]
    )
  end

  def get_stream_code_name_from_channel(channel_name) do
    [_prefix | rest] = String.split(channel_name, ":")
    Enum.join(rest, ":")
  end

  @spec now_unix(System.time_unit()) :: integer()
  def now_unix(unit \\ :second) do
    System.os_time(unit)
  end

  @spec now_iso() :: String.t()
  def now_iso() do
    DateTime.utc_now()
    |> DateTime.to_iso8601()
  end

  @spec recase(String.t() | nil) :: String.t() | nil
  def recase(data)

  def recase(data) when is_binary(data), do: Recase.to_title(data)
  def recase(_data), do: nil

  @spec get_shoutcast_data(String.t(), String.t()) :: String.t() | nil | :error
  def get_shoutcast_data(url, name) do
    Logger.debug("Data provider - #{url} (#{name}): data")

    try do
      data =
        case url do
          "url:" <> real_url -> real_url
          _ -> url
        end
        |> String.split("/stream")
        |> hd()
        |> Kernel.<>("/currentsong")
        |> get()

      {:shoutcast, nil, data}
    rescue
      _ ->
        Logger.debug("Data provider - #{url} (#{name}): data error rescue")
        :error
    end
  end

  @spec get_icecast_data(String.t(), String.t()) :: String.t() | nil | :error
  def get_icecast_data(url, name) do
    Logger.debug("Data provider - #{url} (#{name}): data")

    try do
      data =
        case url do
          "url:" <> real_url -> real_url
          _ -> url
        end
        |> String.split("/live")
        |> hd()
        |> Kernel.<>("/status-json.xsl")
        |> get()
        |> JSON.decode!()
        |> Map.get("icestats", %{})
        |> Map.get("source")

      {:icecast, nil, data}
    rescue
      _ ->
        Logger.debug("Data provider - #{url} (#{name}): data error rescue")
        :error
    end
  end

  @spec get_song_from_shoutcast_or_icecast(tuple | atom() | nil, String.t(), String.t()) ::
          map | nil

  def get_song_from_shoutcast_or_icecast(nil, _url, _name), do: nil
  def get_song_from_shoutcast_or_icecast(:error, _url, _name), do: nil

  def get_song_from_shoutcast_or_icecast({_type, _url_status, data}, url, name)
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

  def get_song_from_shoutcast_or_icecast({_type, _url_status, data}, url, name)
      when is_map(data) or is_list(data) do
    # we delegate to the specific icecast function
    case get_song_from_icecast(data, url) do
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

  def get_song_from_shoutcast_or_icecast({_type, _url_status, _data}, _url, _name), do: nil

  def get_song_from_icecast(data, url, name) do
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

  def get_song_from_icecast(data, url) when is_list(data) do
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
        Enum.find_value(entries, fn e ->
          get_song_from_icecast(e, url)
        end)
    end)
  end

  def get_song_from_icecast(%{"yp_currently_playing" => artist_title} = _data, _url)
      when is_binary(artist_title),
      do: %{artist: artist_title, title: nil, cover_url: nil}

  def get_song_from_icecast(%{"artist" => "", "title" => title} = _data, _url)
      when is_binary(title),
      do: %{artist: title, title: nil, cover_url: nil}

  def get_song_from_icecast(%{artist: artist, title: title} = _data, _url)
      when is_binary(artist) and is_binary(title),
      do: %{artist: artist, title: title, cover_url: nil}

  def get_song_from_icecast(%{"title" => artist_title} = _data, _url)
      when is_binary(artist_title),
      do: %{artist: artist_title, title: nil, cover_url: nil}

  def get_song_from_icecast(_data, _url), do: nil
end
