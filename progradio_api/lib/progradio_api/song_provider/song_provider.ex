defmodule ProgRadioApi.SongProvider do
  @doc """
    Get next song refresh in seconds
  """
  @callback get_refresh(String.t(), map() | nil, integer()) :: integer() | nil

  @doc """
    Get auto refresh
  """
  @callback get_auto_refresh(String.t(), map() | nil, integer()) :: integer() | nil

  @doc """
    Get source data as map
  """
  @callback get_data(String.t(), map() | nil) :: map() | nil

  @doc """
    Get artist & song as map
  """
  @callback get_song(String.t(), map() | nil) :: map()

  @doc """
    Indicates if it can refreshes based on metadata or not
  """
  @callback has_custom_refresh() :: boolean()

  # ----- Utils -----

  def get(url) do
    HTTPoison.get!(
      url,
      [{"Cache-Control", "no-cache"}, {"Pragma", "no-cache"}]
    )
  end

  def post(url, body) do
    HTTPoison.post!(
      url,
      body,
      [{"Content-type", "application/json"}]
    )
  end

  def get_stream_code_name_from_channel(channel_name) do
    [_prefix | rest] = String.split(channel_name, ":")
    Enum.join(rest, ":")
  end

  @spec now_unix() :: integer()
  def now_unix() do
    DateTime.utc_now()
    |> DateTime.to_unix()
  end

  @spec now_iso() :: String.t()
  def now_iso() do
    DateTime.utc_now()
    |> DateTime.to_iso8601()
  end

  @spec recase(String.t() | nil) :: String.t() | nil
  def recase(data)

  def recase(nil), do: nil
  def recase(data), do: Recase.to_title(data)
end
