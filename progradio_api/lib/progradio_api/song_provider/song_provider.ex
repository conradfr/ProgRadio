defmodule ProgRadioApi.SongProvider do
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
  @callback get_song(String.t(), map() | nil, map() | nil) :: map() | nil

  @doc """
    Indicates if it can refresh based on metadata or not
  """
  @callback has_custom_refresh() :: boolean()

  @doc """
    Overrides the default auto refresh rate
  """
  @callback get_auto_refresh() :: integer()

  @optional_callbacks get_auto_refresh: 0

  # ----- Utils -----

  def get(url) do
    HTTPoison.get!(
      url,
      [{"Cache-Control", "no-cache"}, {"Pragma", "no-cache"}],
      hackney: [:insecure]
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

  @spec now_unix() :: integer()
  def now_unix() do
    System.os_time(:second)
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
