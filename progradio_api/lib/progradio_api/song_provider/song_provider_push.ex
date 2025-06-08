defmodule ProgRadioApi.SongProviderPush do
  @doc """
    Get pid of the push client that will send events to the song_server
    Client will be killed by song_server exiting
  """
  @callback get_push_client_pid(String.t()) :: {:ok, pid} | :error

  @doc """
    Analyze data from push event and send as a map
  """
  @callback get_data(String.t(), any, map() | nil) :: map() | nil

  @doc """
    Get artist and song as a map
  """
  @callback get_song(String.t(), map() | nil, map() | nil) :: map() | nil
end
