defmodule ProgRadioApi.SongManager do
  require Logger

  @spec join(String.t()) :: any()
  def join(song_topic) do
    case Registry.lookup(SongDataProviderRegistry, song_topic) do
      [] ->
        DynamicSupervisor.start_child(
          ProgRadioApi.SongDynamicSupervisor,
          {ProgRadioApi.SongServer, song_topic}
        )

      [{pid, _value}] ->
        GenServer.cast(pid, :broadcast)
    end
  end
end
