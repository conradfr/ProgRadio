defmodule ProgRadioApi.SongServer do
  use GenServer, restart: :transient
  require Logger
  alias ProgRadioApiWeb.Presence
  alias ProgRadioApi.StreamSong
  alias ProgRadioApi.RadioStream

  @refresh_song_interval 15000
  @refresh_song_interval_long 30000
  @refresh_presence_interval 60000

  # ----- Client Interface -----

  def start_link({song_topic, nil, nil} = _arg) do
    name = {:via, Registry, {SongSongProviderRegistry, song_topic}}

    GenServer.start_link(
      __MODULE__,
      %{
        module: ProgRadioApi.SongProvider.Icecast,
        name: song_topic,
        song: nil,
        last_data: nil,
        collection_topic: nil,
        db_data: nil
      },
      name: name
    )
  end

  def start_link({song_topic, radio_code_name, db_data} = _arg) do
    name = {:via, Registry, {SongSongProviderRegistry, song_topic}}

    module_name =
      radio_code_name
      |> Macro.camelize()
      |> (&("Elixir.ProgRadioApi.SongProvider." <> &1)).()
      |> String.to_existing_atom()

    collection_topic =
      case Map.get(db_data, :collection_code_name, nil) do
        nil -> nil
        collection_code_name -> "collection:" <> collection_code_name
      end

    GenServer.start_link(
      __MODULE__,
      %{
        module: module_name,
        name: song_topic,
        song: nil,
        last_data: nil,
        collection_topic: collection_topic,
        db_data: db_data
      },
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
    broadcast_song(state.name, state.song, state.collection_topic)
    {:noreply, state}
  end

  @impl true
  def handle_info(
        {:refresh, :auto},
        %{module: module, name: name, last_data: last_data, db_data: db_data} = state
      ) do
    with {data, song} <- get_data_song(module, name, last_data),
         false <- data == :error do
      spawn(fn -> update_status(song, db_data) end)

      how_many_connected = how_many_connected(name, state.collection_topic)

      broadcast_song(name, song, state.collection_topic)

      refresh_rate =
        if apply(state.module, :has_custom_refresh, []) == true do
          apply(module, :get_auto_refresh, [name, data, @refresh_song_interval_long]) ||
            @refresh_song_interval_long
        else
          apply(module, :get_auto_refresh, [name, data, @refresh_song_interval]) ||
            @refresh_song_interval
        end

      Process.send_after(self(), {:refresh, :auto}, refresh_rate)

      Logger.debug(
        "Data provider - #{name}: song updated (timer) - #{how_many_connected} clients connected"
      )

      {:noreply, %{state | song: song, last_data: data}}
    else
      _ ->
        broadcast_song(name, nil, nil)
        ProgRadioApiWeb.Endpoint.broadcast!(state.name, "quit", %{})
        Logger.error("Data provider - #{state.name}: fetching error, exiting")
        {:stop, :normal, nil}
    end
  end

  @impl true
  def handle_info(
        {:refresh, _},
        %{module: module, name: name, last_data: last_data, db_data: db_data} = state
      ) do
    {data, song} = get_data_song(module, name, last_data)
    spawn(fn -> update_status(song, db_data) end)

    broadcast_song(name, song, state.collection_topic)

    next_refresh =
      apply(module, :get_refresh, [name, data, @refresh_song_interval]) || @refresh_song_interval

    Process.send_after(self(), {:refresh, :scheduled}, next_refresh)

    Logger.debug(
      "Data provider - #{name}: song updated, next update in #{trunc(next_refresh / 1000)} seconds"
    )

    {:noreply, %{state | song: song, last_data: data}}
  end

  @impl true
  def handle_info(:presence, %{name: name, collection_topic: collection_topic} = state) do
    how_many_connected = how_many_connected(name, collection_topic)

    case how_many_connected do
      0 ->
        broadcast_song(name, nil, nil)
        Logger.info("Data provider - #{name}: no client connected, exiting")
        {:stop, :normal, nil}

      _ ->
        Logger.debug("Data provider - #{name}: #{how_many_connected} clients connected")

        Process.send_after(self(), :presence, @refresh_presence_interval)
        {:noreply, state}
    end
  end

  # ----- Internal -----

  @spec broadcast_song(String.t(), map() | nil, String.t() | nil) :: none()
  defp broadcast_song(name, song, collection_topic) do
    data = %{name: name, song: song}

    unless collection_topic == nil,
      do:
        ProgRadioApiWeb.Endpoint.broadcast!(
          collection_topic,
          "playing",
          Map.put(data, :topic, collection_topic)
        )

    ProgRadioApiWeb.Endpoint.broadcast!(
      name,
      "playing",
      Map.put(data, :topic, name)
    )

    #    ProgRadioApiWeb.Endpoint.broadcast!(
    #      "songs",
    #      "playing",
    #      Map.put(data, :topic, name)
    #    )
  end

  @spec get_data_song(atom(), String.t(), map() | nil) :: tuple()
  defp get_data_song(module, name, last_data) do
    data = apply(module, :get_data, [name, last_data])
    song = apply(module, :get_song, [name, data]) || %{}

    {data, song}
  end

  @spec update_status(map(), map() | nil) :: any()
  defp update_status(song, db_data)

  defp update_status(song, %{:type => "radio_stream"} = db_data) do
    if song == %{} or db_data == nil or
         ((song.artist == nil or song.artist == "") and (song.title == nil or song.title == "")) do
      RadioStream.update_status(db_data.id, true)
    else
      RadioStream.update_status(db_data.id, false)
    end
  end

  defp update_status(song, %{:type => "stream_song"} = db_data) do
    if song == %{} or db_data == nil or
         ((song.artist == nil or song.artist == "") and (song.title == nil or song.title == "")) do
      StreamSong.update_status(db_data.id, true)
    else
      StreamSong.update_status(db_data.id, false)
    end
  end

  defp update_status(song, db_data) do
    # nothing
    Logger.debug("Updating status, no match: #{inspect(song)} - #{inspect(db_data)}")
  end

  defp how_many_connected(topic, collection_topic) do
    [
      how_many_connected_stream(topic),
      how_many_connected_collection(collection_topic)
    ]
    |> Enum.max()
  end

  defp how_many_connected_stream(topic) do
    Presence.list(topic)
    |> Kernel.map_size()
  end

  defp how_many_connected_collection(collection_topic) do
    Presence.list(collection_topic)
    |> Kernel.map_size()
  end
end
