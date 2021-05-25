defmodule ProgRadioApi.SongServer do
  use GenServer, restart: :transient
  require Logger
  alias ProgRadioApiWeb.Presence

  @refresh_song_interval 15000
  @refresh_presence_interval 20000

  # ----- Client Interface -----

  def start_link({song_topic, nil} = _arg) do
    name = {:via, Registry, {SongSongProviderRegistry, song_topic}}

    GenServer.start_link(
      __MODULE__,
      %{module: ProgRadioApi.SongProvider.Icecast, name: song_topic, song: nil, last_data: nil},
      name: name
    )
  end

  def start_link({song_topic, radio_code_name} = _arg) do
    name = {:via, Registry, {SongSongProviderRegistry, song_topic}}

    module_name =
      radio_code_name
      |> Macro.camelize()
      |> (&("Elixir.ProgRadioApi.SongProvider." <> &1)).()
      |> String.to_existing_atom()

    GenServer.start_link(
      __MODULE__,
      %{module: module_name, name: song_topic, song: nil, last_data: nil},
      name: name
    )
  end

  # ----- Server callbacks -----

  @impl true
  def init(state) do
    Logger.info("Data provider - #{state.name}: starting ...")

    if apply(state.module, :has_custom_refresh, []) == true,
      do: Process.send_after(self(), {:refresh, :one_off}, 1000)

    Process.send_after(self(), {:refresh, :auto}, 250)
    Process.send_after(self(), :presence, @refresh_presence_interval)

    {:ok, state}
  end

  @impl true
  def handle_cast(:broadcast, state) do
    ProgRadioApiWeb.Endpoint.broadcast!(state.name, "playing", state.song)
    {:noreply, state}
  end

  @impl true
  def handle_info({:refresh, :auto}, %{module: module, name: name, last_data: last_data} = state) do
    with {data, song} <- get_data_song(module, name, last_data),
         false <- data == :error do
      how_many_connected =
        Presence.list(state.name)
        |> Kernel.map_size()

      ProgRadioApiWeb.Endpoint.broadcast!(state.name, "playing", song)

      refresh_rate = apply(module, :get_auto_refresh, [name, data, @refresh_song_interval]) || @refresh_song_interval

      Process.send_after(self(), {:refresh, :auto}, refresh_rate)

      Logger.info(
        "Data provider - #{name}: song updated (timer) - #{how_many_connected} clients connected"
      )

      {:noreply, %{state | song: song, last_data: data}}
    else
      _ ->
        ProgRadioApiWeb.Endpoint.broadcast!(state.name, "quit", %{})
        Logger.info("Data provider - #{state.name}: fetching error, exiting")
        {:stop, :normal, nil}
    end
  end

  @impl true
  def handle_info({:refresh, _}, %{module: module, name: name, last_data: last_data} = state) do
    {data, song} = get_data_song(module, name, last_data)

    ProgRadioApiWeb.Endpoint.broadcast!(state.name, "playing", song)

    next_refresh =
      apply(module, :get_refresh, [name, data, @refresh_song_interval]) || @refresh_song_interval

    Process.send_after(self(), {:refresh, :scheduled}, next_refresh)

    Logger.info(
      "Data provider - #{name}: song updated, next update in #{trunc(next_refresh / 1000)} seconds"
    )

    {:noreply, %{state | song: song, last_data: data}}
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

  # ----- Internal -----

  @spec get_data_song(atom(), String.t(), map() | nil) :: tuple()
  defp get_data_song(module, name, last_data) do
    data = apply(module, :get_data, [name, last_data])
    song = apply(module, :get_song, [name, data]) || %{}

    {data, song}
  end
end
