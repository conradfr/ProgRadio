defmodule ProgRadioApi.SongManager do
  require Logger

  @spec join(String.t()) :: any()
  def join(song_topic) do
    case Registry.lookup(SongDataProviderRegistry, song_topic) do
      [] ->
        data_provider =
          song_topic
          |> String.split(":")
          |> List.last()
          |> Macro.camelize()

        module_name =
          ("Elixir.ProgRadioApi.DataProvider." <> data_provider)
          |> String.to_existing_atom()

        DynamicSupervisor.start_child(
          ProgRadioApi.SongDynamicSupervisor,
          {module_name, []}
        )

      [{pid, _value}] ->
        GenServer.cast(pid, :broadcast)
    end
  end
end
