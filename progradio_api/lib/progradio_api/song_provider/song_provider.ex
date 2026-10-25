defmodule ProgRadioApi.SongProvider do
  alias ProgRadioApi.Cache
  alias ProgRadioApi.Utils.ReqUtils

  @doc """
    Get next song refresh in seconds
  """
  @callback get_refresh(String.t(), map() | nil, integer()) :: integer() | nil

  @doc """
    Get source data as a map
  """
  @callback get_data(String.t(), map() | nil, map() | nil) :: map() | nil

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

  # duplicated in icecast.ex
  @forbidden_titles [
    "nodesc",
    "no desc",
    "undefined",
    "Unknown",
    "Unknown - Unknown",
    " - ",
    "-",
    "AD",
    "DJ Mike Llama - Llama Whippin' Intro",
    "Stream not found",
    "Now Playing info goes here",
    "Dj Online"
  ]

  @timeout 5_000
  @max_body_size 1_048_576

  @cache_key_json_prefix "song_provider_json_"
  @cache_ttl_default_seconds 30

  def get(url) do
    url
    |> get_response()
    |> Map.get(:body)
  end

  # when the status is needed (body not decoded)
  # the body is collected by us so it can be capped: some urls end on the audio stream itself (an api url
  # redirected to it for example), which would be downloaded endlessly as the receive timeout is per chunk
  def get_response(url) do
    request =
      url
      |> ReqUtils.get_song_options_for(
        retry: false,
        decode_body: false,
        compressed: true,
        receive_timeout: @timeout,
        into: &collect_body/2
      )
      |> Keyword.put(:url, url)
      # connect timeout: the one of the pool
      |> Req.new()
      # the compressed option has no effect with into: header set and body decompressed by us
      |> Req.Request.put_new_header("accept-encoding", "gzip")

    {request, response} = Req.run!(request)

    case Req.Steps.decompress_body({%{request | into: nil}, response}) do
      {_request, %Req.Response{} = response} -> response
      {_request, exception} -> raise exception
    end
  end

  # stops on an audio/video stream (not on a playlist) or when the body gets too big,
  # the (partial) body is then not what the caller expects and handled as such
  defp collect_body({:data, data}, {request, response}) do
    response = %{response | body: response.body <> data}

    if audio_stream?(response) or byte_size(response.body) > @max_body_size,
      do: {:halt, {request, response}},
      else: {:cont, {request, response}}
  end

  defp audio_stream?(response) do
    response
    |> Req.Response.get_header("content-type")
    |> Enum.any?(fn content_type ->
      content_type = String.downcase(content_type)

      String.starts_with?(content_type, ["audio/", "video/"]) and
        not String.contains?(content_type, ["mpegurl", "scpls"])
    end)
  end

  # todo revisit when Req 0.8 is out w/ native json support
  def get_json(url) do
    url
    |> get()
    |> JSON.decode!()
  end

  def get_json_cached(url, ttl_seconds \\ @cache_ttl_default_seconds) do
    cache_key = @cache_key_json_prefix <> url

    case Cache.get(cache_key) do
      nil ->
        Cache.transaction([keys: [cache_key]], fn ->
          # another process may have fetched it while we were waiting for the lock
          case Cache.get(cache_key) do
            nil ->
              data = get_json(url)
              Cache.put(cache_key, data, ttl: :timer.seconds(ttl_seconds))
              data

            data ->
              data
          end
        end)

      data ->
        data
    end
  end

  def get_with_fetcher(url, keepTimeSeconds \\ 30) do
    fetcher_url = Application.get_env(:progradio_api, :fetcher_url)
    fetcher_token = Application.get_env(:progradio_api, :fetcher_token)

    Req.get!(
      "#{fetcher_url}/fetch-html2",
      params: [url: url, keep: keepTimeSeconds],
      headers: [
        {"Authorization", "Bearer #{fetcher_token}"},
        {"Cache-Control", "no-cache"},
        {"Pragma", "no-cache"}
      ],
      redirect: true,
      connect_options: [timeout: @timeout],
      receive_timeout: @timeout
    )
    |> Map.get(:body)
  end

  def get_json_with_fetcher(url, keepTimeSeconds \\ 30) do
    fetcher_url = Application.get_env(:progradio_api, :fetcher_url)
    fetcher_token = Application.get_env(:progradio_api, :fetcher_token)

    Req.get!(
      "#{fetcher_url}/fetch-json2",
      params: [url: url, keep: keepTimeSeconds],
      headers: [
        {"Authorization", "Bearer #{fetcher_token}"},
        {"Cache-Control", "no-cache"},
        {"Pragma", "no-cache"}
      ],
      redirect: true,
      connect_options: [timeout: @timeout],
      receive_timeout: @timeout
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
      json: body,
      headers: [{"Cache-Control", "no-cache"}],
      redirect: false,
      connect_options: [timeout: 15_000]
    )
  end

  def get_stream_code_name_from_channel(channel_name) do
    [_prefix | rest] = String.split(channel_name, ":")
    Enum.join(rest, ":")
  end

  def get_id_from_list(stream_code_name, list)
      when is_binary(stream_code_name) and is_map(list) do
    Map.get(list, stream_code_name)
  end

  @doc """
  Removes the "type=http" query parameter from a URL, cleaning up any
  leftover "?" / "&" separators.
  This is for shoutcast/icecast non-ssl urls
  """
  @spec remove_type_http(String.t()) :: String.t()
  def remove_type_http(url) do
    case String.split(url, "?", parts: 2) do
      [base] ->
        base

      [base, query] ->
        query
        |> String.split("&")
        |> Enum.reject(&(&1 == "type=http"))
        |> Enum.join("&")
        |> case do
          "" -> base
          new_query -> base <> "?" <> new_query
        end
    end
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

  def get_forbidden_titles(), do: @forbidden_titles
end
