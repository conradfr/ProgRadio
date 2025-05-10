defmodule ProgRadioApi.SongServer do
  use GenServer, restart: :transient
  require Logger
  alias ProgRadioApiWeb.Presence
  alias ProgRadioApi.StreamSong
  alias ProgRadioApi.SongProvider
  alias ProgRadioApi.RadioStream
  alias ProgRadioApi.TaskSupervisor

  @max_song_history 10
  @history_ttl 60

  @refresh_song_interval 10000
  @refresh_song_interval_long 20000
  @refresh_song_retries_increment 10000

  @refresh_song_retries_max 10
  @refresh_song_retries_max_reset_at 100
  @refresh_song_retries_max_interval 120_000
  @refresh_presence_interval 120_000

  @max_seconds_errors_before_quitting 600
  @task_timeout 15000

  # ----- Client Interface -----

  def start_link({song_topic, nil, nil} = _arg) do
    name = {:via, Registry, {SongProviderRegistry, song_topic}}

    GenServer.start_link(
      __MODULE__,
      %{
        module: get_url_module(song_topic),
        name: song_topic,
        song: %{},
        song_history: restore_history(song_topic),
        last_data: nil,
        retries: 0,
        db_data: nil,
        last_timestamp: SongProvider.now_unix(),
        tasks: %{}
      },
      name: name
    )
  end

  def start_link({song_topic, radio_code_name, db_data} = _arg) do
    name = {:via, Registry, {SongProviderRegistry, song_topic}}

    module_name =
      radio_code_name
      |> Macro.camelize()
      |> (&("Elixir.ProgRadioApi.SongProvider." <> &1)).()
      |> String.to_existing_atom()

    GenServer.start_link(
      __MODULE__,
      %{
        module: module_name,
        name: song_topic,
        song: %{},
        song_history: restore_history(song_topic),
        last_data: nil,
        retries: 0,
        db_data: db_data,
        last_timestamp: SongProvider.now_unix(),
        tasks: %{}
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
    broadcast_song(state.name, state.song)
    {:noreply, state}
  end

  # auto refresh
  @impl true
  def handle_info(
        {:refresh, :auto},
        %{
          module: module,
          name: name,
          last_data: last_data
        } =
          state
      ) do
    timestamp = SongProvider.now_unix()
    task_ref = get_data_song_task(module, name, :auto, last_data)
    state = put_in(state.tasks[task_ref], timestamp)
    {:noreply, state}
  end

  # refresh based on song ending data
  @impl true
  def handle_info(
        {:refresh, _},
        %{
          module: module,
          name: name,
          last_data: last_data,
          song: last_song,
          song_history: song_history,
          db_data: db_data
        } = state
      ) do
    timestamp = SongProvider.now_unix()
    task_ref = get_data_song_task(module, name, :custom, last_data)
    state = put_in(state.tasks[task_ref], timestamp)
    {:noreply, state}
  end

  # get_song_data task return for :auto
  def handle_info(
        {ref, {data, song, :auto}},
        %{
          module: module,
          name: name,
          song: last_song,
          song_history: song_history,
          last_data: last_data,
          retries: retries,
          db_data: db_data,
          last_timestamp: last_timestamp
        } = state
      ) do
    Process.demonitor(ref, [:flush])
    {task_timestamp, updated_state} = pop_in(state.tasks[ref])

    with true <- is_nil(last_timestamp) or task_timestamp >= last_timestamp,
         updated_retries <- get_updated_retries(name, song, retries),
         false <- data == :error do
      broadcast_song_if_needed(name, song, last_song)
      updated_song_history = update_song_history(last_song, song_history, song)
      broadcast_song_history_if_needed(name, updated_song_history, song_history)
      update_status(song, db_data)

      next_refresh =
        cond do
          Kernel.function_exported?(state.module, :get_auto_refresh, 0) == true ->
            apply(state.module, :get_auto_refresh, [])

          apply(state.module, :has_custom_refresh, []) == true ->
            @refresh_song_interval_long

          true ->
            @refresh_song_interval
        end
        |> Kernel.+(Enum.random(-5000..5000))
        |> increment_interval(updated_retries)

      how_many_connected = how_many_connected(name)

      Logger.debug(
        "Data provider - #{name}: song updated (timer, next: #{trunc(next_refresh / 1000)}s, retries: #{updated_retries}) - #{how_many_connected} clients connected"
      )

      Process.send_after(self(), {:refresh, :auto}, next_refresh)

      {:noreply,
       %{
         updated_state
         | song: song,
           last_data: data,
           song_history: updated_song_history,
           retries: updated_retries,
           last_timestamp: SongProvider.now_unix()
       }, :hibernate}
    else
      _ ->
        broadcast_song(name, nil)

        # quitting if delay reached since last successful attempt
        if SongProvider.now_unix() - last_timestamp > @max_seconds_errors_before_quitting do
          ProgRadioApiWeb.Endpoint.broadcast!(state.name, "quit", %{})
          Logger.error("Data provider - #{state.name}: fetching error, exiting")
          {:stop, :normal, nil}
        else
          Logger.error("Data provider - #{state.name}: fetching error, no quitting")
          Process.send_after(self(), {:refresh, :auto}, @refresh_song_retries_max_interval)
          {:noreply, %{updated_state | song: nil, last_data: nil}, :hibernate}
        end
    end
  end

  # get_song_data task return for non auto
  def handle_info(
        {ref, {data, song, _}},
        %{
          module: module,
          name: name,
          song: last_song,
          song_history: song_history,
          last_data: last_data,
          retries: retries,
          db_data: db_data,
          last_timestamp: last_timestamp
        } = state
      ) do
    Process.demonitor(ref, [:flush])
    {task_timestamp, updated_state} = pop_in(state.tasks[ref])

    with true <- is_nil(last_timestamp) or task_timestamp >= last_timestamp,
         updated_retries <- get_updated_retries(name, song, retries),
         false <- data == :error do
      broadcast_song(name, song)
      updated_song_history = update_song_history(last_song, song_history, song)
      broadcast_song_history_if_needed(name, updated_song_history, song_history)
      update_status(song, db_data)

      next_refresh =
        apply(module, :get_refresh, [name, data, @refresh_song_interval]) ||
          @refresh_song_interval
          |> Kernel.+(Enum.random(-5..5))

      Logger.debug(
        "Data provider - #{name}: song updated, next update in #{trunc(next_refresh / 1000)} seconds"
      )

      Process.send_after(self(), {:refresh, :scheduled}, next_refresh)

      {:noreply,
       %{
         updated_state
         | song: song,
           last_data: data,
           song_history: updated_song_history,
           retries: updated_retries,
           last_timestamp: SongProvider.now_unix()
       }, :hibernate}
    else
      _ ->
        next_refresh =
          apply(module, :get_refresh, [name, nil, @refresh_song_interval]) ||
            @refresh_song_interval
            |> Kernel.+(Enum.random(-5..5))

        Logger.error("Data provider - #{state.name}: fetching error")

        Process.send_after(self(), {:refresh, :scheduled}, next_refresh)

        {:noreply, updated_state}
    end
  end

  @impl true
  def handle_info(:presence, %{name: name} = state) do
    how_many_connected = how_many_connected(name)

    case how_many_connected do
      0 ->
        broadcast_song(name, nil)
        Logger.info("Data provider - #{name}: no client connected, exiting")
        {:stop, :normal, nil}

      _ ->
        Logger.debug("Data provider - #{name}: #{how_many_connected} clients connected")

        Process.send_after(
          self(),
          :presence,
          @refresh_presence_interval + Enum.random(-3000..3000)
        )

        {:noreply, state}
    end
  end

  def handle_info({:DOWN, ref, _, _, reason}, state) do
    Logger.error("Task failed with reason #{inspect(reason)}")
    {:noreply, %{state | tasks: Map.delete(state.tasks, ref)}}
  end

  # ----- Internal -----

  defp broadcast_song_if_needed(name, %{} = song, %{} = last_song) when song !== last_song do
    broadcast_song(name, song)
  end

  defp broadcast_song_if_needed(name, song, _last_song) do
    # as safety, still broadcast % of the time
    if :rand.uniform(10) > 7, do: broadcast_song(name, song)

    Logger.debug("Data provider - #{name}: song updated, no broadcast")
  end

  @spec broadcast_song(String.t(), map() | nil) :: none()
  defp broadcast_song(name, song) do
    data = %{topic: name, name: name, song: song}

    ProgRadioApiWeb.Endpoint.broadcast!(
      name,
      "playing",
      data
    )
  end

  defp broadcast_song_history_if_needed(name, song_history, _last_song_history)
       when length(song_history) < @max_song_history do
    broadcast_song_history(name, song_history)
  end

  defp broadcast_song_history_if_needed(name, song_history, last_song_history) do
    case song_history -- last_song_history do
      [] ->
        Logger.debug("Data provider - #{name}: song history updated, no broadcast")

      _ ->
        broadcast_song_history(name, song_history)
    end
  end

  @spec broadcast_song_history(String.t(), list) :: none()
  defp broadcast_song_history(name, song_history) do
    Redix.command!(:redix, [
      "SET",
      "history_" <> name,
      Jason.encode!(song_history),
      "EX",
      @history_ttl
    ])

    data = %{name: name, history: song_history}

    ProgRadioApiWeb.Endpoint.broadcast!(
      name,
      "song_history",
      Map.put(data, :topic, name)
    )
  end

  @spec get_data_song_task(atom(), String.t(), atom(), map() | nil) :: tuple()
  defp get_data_song_task(module, name, refresh_type, last_data) do
    task =
      Task.Supervisor.async_nolink(TaskSupervisor, fn ->
        try do
          task_data = Task.Supervisor.async(TaskSupervisor, module, :get_data, [name, last_data])
          data = Task.await(task_data, @task_timeout)

          song =
            unless data == :error do
              task_song = Task.Supervisor.async(TaskSupervisor, module, :get_song, [name, data])
              Task.await(task_song)
              #          apply(module, :get_song, [name, data])
            else
              %{}
            end

          {data, song, refresh_type}
        rescue
          _ ->
            {nil, %{}, refresh_type}
        catch
          :exit, _ ->
            {nil, %{}, refresh_type}
        end
      end)

    task.ref
  end

  defp get_updated_retries(name, song, retries) do
    case song do
      %{} = map when map_size(map) == 0 -> retries + 1
      nil -> retries + 1
      _ -> 0
    end
    |> case do
      value when value == @refresh_song_retries_max_reset_at ->
        Logger.debug("Data provider - #{name}: retries reset")
        1

      value ->
        value
    end
  end

  # ---------- UPDATE STATUS ----------

  @spec update_status(map() | nil, map() | nil) :: any()
  defp update_status(song, db_data)

  defp update_status(%{} = song, %{:type => "radio_stream"} = db_data) do
    if map_size(song) == 0 or
         ((Map.get(song, :artist) == nil or song.artist == "") and
            (Map.get(song, :title) == nil or song.title == "")) do
      RadioStream.update_status(db_data.id, true)
    else
      RadioStream.update_status(db_data.id, false)
    end
  end

  defp update_status(%{} = song, %{:type => "stream_song"} = db_data) do
    if map_size(song) == 0 or
         ((Map.get(song, :artist) == nil or song.artist == "") and
            (Map.get(song, :title) == nil or song.title == "")) do
      StreamSong.update_status(db_data.id, true)
    else
      StreamSong.update_status(db_data.id, false)
    end
  end

  defp update_status(song, db_data) do
    # nothing
    Logger.debug("Updating status, no match: #{inspect(song)} - #{inspect(db_data)}")
  end

  # ---------- SONG HISTORY ----------

  @spec update_song_history(map() | nil, list, map() | nil) :: list
  defp update_song_history(song, song_history, new_song)

  # no song to add
  defp update_song_history(nil, song_history, _new_song), do: song_history

  # no song to add
  defp update_song_history(%{} = song, song_history, _new_song) when song == %{}, do: song_history

  # this is the current song
  defp update_song_history(%{} = song, song_history, new_song) when song == new_song,
    do: song_history

  # same song as the last entry
  defp update_song_history(%{} = song, song_history, _new_song) when hd(song_history) == song,
    do: song_history

  defp update_song_history(%{} = song, song_history, new_song)
       when song != new_song and length(song_history) < @max_song_history,
       do: [song | song_history]

  defp update_song_history(%{} = song, song_history, _new_song) do
    song_history
    |> List.delete_at(-1)
    |> (&[song | &1]).()
  end

  defp restore_history(name) do
    case Redix.command(:redix, ["GET", "history_" <> name]) do
      {:ok, nil} -> []
      {:ok, history} -> Jason.decode!(history)
      _ -> []
    end
  end

  # ---------- CONNECTED ----------

  defp how_many_connected(topic), do: how_many_connected_stream(topic)

  defp how_many_connected_stream(topic) do
    Presence.list(topic)
    |> Kernel.map_size()
  end

  defp increment_interval(_base_refresh, retries) when retries >= @refresh_song_retries_max,
    do: @refresh_song_retries_max_interval

  defp increment_interval(base_refresh, retries),
    do: base_refresh + @refresh_song_retries_increment * retries

  defp get_url_module(song_topic) do
    cond do
      String.contains?(song_topic, ".m3u8") ->
        ProgRadioApi.SongProvider.Hls

      String.contains?(song_topic, ".rcast.net") ->
        ProgRadioApi.SongProvider.Rcast

      String.contains?(song_topic, "play.radioking") or
          String.contains?(song_topic, "www.radioking") ->
        ProgRadioApi.SongProvider.Radioking

      true ->
        ProgRadioApi.SongProvider.Icecast
    end
  end
end
