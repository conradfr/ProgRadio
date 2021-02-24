defmodule ProgRadioApi.SongServer do
  use GenServer, restart: :transient
  require Logger
  alias ProgRadioApiWeb.Presence

  @refresh_song_interval 15000
  @refresh_presence_interval 10000

  # ----- Client Interface -----

  def start_link(arg) do
    name = {:via, Registry, {SongDataProviderRegistry, arg}}

    module_name =
      arg
      |> String.split(":")
      |> List.last()
      |> Macro.camelize()
      |> (&("Elixir.ProgRadioApi.DataProvider." <> &1)).()
      |> String.to_existing_atom()

    GenServer.start_link(__MODULE__, %{module: module_name, name: arg, song: nil}, name: name)
  end

  # ----- Server callbacks -----

  @impl true
  def init(state) do
    Logger.info("Data provider - #{state.name}: starting ...")
    Process.send_after(self(), :refresh, 500)
    Process.send_after(self(), :presence, @refresh_presence_interval)
    {:ok, state}
  end

  @impl true
  def handle_cast(:broadcast, state) do
    ProgRadioApiWeb.Endpoint.broadcast!(state.name, "playing", state.song)
    {:noreply, state}
  end

  @impl true
  def handle_info(:refresh, %{module: module, name: name} = state) do
    data = apply(module, :get_data, [name])
    song = apply(module, :get_song, [name, data])

    ProgRadioApiWeb.Endpoint.broadcast!(state.name, "playing", song)

    next_refresh =
      apply(module, :get_refresh, [name, data, @refresh_song_interval]) || @refresh_song_interval

    Process.send_after(self(), :refresh, next_refresh)

    Logger.info(
      "Data provider - #{name}: song updated, next update in #{trunc(next_refresh / 1000)} seconds"
    )

    {:noreply, %{module: module, name: name, song: song}}
  end

  @impl true
  def handle_info(:presence, state) do
    how_many_connected =
      Presence.list(state.name)
      |> Kernel.map_size()

    case how_many_connected do
      0 ->
        Logger.info("Data provider - #{state.name}: no client connected, exiting")
        {:stop, :normal, nil}

      _ ->
        Logger.debug("Data provider - #{state.name}: #{how_many_connected} clients connected")

        Process.send_after(self(), :presence, @refresh_presence_interval)
        {:noreply, state}
    end
  end
end
