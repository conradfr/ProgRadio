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
end
