defmodule ProgRadioApi.DataProvider do
  @doc """
    Get next song refresh in seconds
  """
  @callback get_refresh(String.t(), map() | nil, integer()) :: integer() | nil

  @doc """
    Get source data as map
  """
  @callback get_data(String.t()) :: map() | nil

  @doc """
    Get artist & song as map
  """
  @callback get_song(String.t(), map() | nil) :: map()
end
