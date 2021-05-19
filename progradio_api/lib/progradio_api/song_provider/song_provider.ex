defmodule ProgRadioApi.SongProvider do
  @doc """
    Get next song refresh in seconds
  """
  @callback get_refresh(String.t(), map() | nil, integer()) :: integer() | nil

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
      []
    )
  end

  def get_stream_code_name_from_channel(channel_name) do
    channel_name
    |> String.split(":")
    |> List.last()
  end

  @spec now_unix() :: integer()
  def now_unix() do
    DateTime.utc_now()
    |> DateTime.to_unix()
  end

  @spec recase(String.t() | nil) :: String.t() | nil
  def recase(data)

  def recase(nil), do: nil
  def recase(data), do: Recase.to_title(data)
end
