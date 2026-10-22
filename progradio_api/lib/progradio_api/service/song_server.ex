defmodule ProgRadioApi.SongServer do
  use GenServer, restart: :transient
  require Logger
  alias ProgRadioApiWeb.Presence
  alias ProgRadioApi.StreamSong
  alias ProgRadioApi.SongManager
  alias ProgRadioApi.SongProvider
  alias ProgRadioApi.TaskSupervisor

  @max_song_history 10
  # songs of the history checked against a new entry before broadcasting it
  @recent_song_history 3
  @history_ttl 600
  @song_ttl 60

  # JSON keys restored from Redis => song map keys
  @song_keys %{
    "artist" => :artist,
    "title" => :title,
    "cover_url" => :cover_url,
    "detected_at" => :detected_at
  }

  @refresh_song_interval 10000
  @refresh_song_interval_long 20000
  @refresh_song_interval_persistent_no_connected 60000
  @refresh_song_retries_increment 10000

  @refresh_song_retries_max 10
  @refresh_song_retries_max_reset_at 100
  @refresh_song_retries_max_interval 120_000
  @refresh_presence_interval 120_000

  @max_seconds_errors_before_quitting 600
  @task_timeout 15000

  # ----- Client Interface -----

  def start_link({song_topic, nil, db_data} = _arg) do
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
        db_data: db_data,
        last_timestamp: SongProvider.now_unix(),
        tasks: %{},
        push_pid: nil
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
        tasks: %{},
        push_pid: nil
      },
      name: name
    )
  end

  # ----- Server callbacks -----

  @impl true
  def init(state) do
    Logger.info("Data provider - #{state.name}: starting ...")

    # There is two types of module, one supporting push events and the other retrieving the data itself w/ refreshes
    updated_state =
      case Code.ensure_loaded?(state.module) and
             Kernel.function_exported?(state.module, :get_push_client_pid, 1) do
        true ->
          {:ok, pid} = apply(state.module, :get_push_client_pid, [state.name])
          %{state | push_pid: pid}

        false ->
          if apply(state.module, :has_custom_refresh, [state.name]) == true,
            do: Process.send_after(self(), {:refresh, :one_off}, 1000)

          Process.send_after(self(), {:refresh, :auto}, 250)
          state
      end

    Process.send_after(self(), :presence, @refresh_presence_interval)

    {:ok, updated_state}
  end

  @impl true
  def handle_cast({:send_last_song_to, pid, stream_id}, state) do
    name = if !is_nil(stream_id), do: "song_next:" <> stream_id, else: state.name

    data = %{
      topic: state.name,
      name: name,
      song: state.song,
      stream_id: stream_id
    }

    send(pid, {:push_song, "playing", data})

    data = %{
      name: name,
      history: state.song_history,
      topic: name,
      stream_id: stream_id
    }

    send(pid, {:push_song, "song_history", data})

    {:noreply, state}
  end

  @impl true
  def handle_cast({:add_stream_id, stream_id}, state) do
    db_data = state.db_data || %{}

    # List.wrap: nil -> [], single id -> [id]
    stream_ids = db_data |> Map.get(:stream_ids) |> List.wrap()

    stream_ids =
      if stream_id in stream_ids, do: stream_ids, else: stream_ids ++ [stream_id]

    {:noreply, %{state | db_data: Map.put(db_data, :stream_ids, stream_ids)}}
  end

  # auto refresh
  @impl true
  def handle_info(
        {:refresh, :auto},
        %{
          module: module,
          name: name,
          last_data: last_data,
          song: last_song
        } =
          state
      ) do
    timestamp = SongProvider.now_unix()

    task_ref =
      get_data_song_task(module, name, :auto, last_data, last_song, get_db_song_data(state))

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
          song: last_song
        } = state
      ) do
    timestamp = SongProvider.now_unix()

    task_ref =
      get_data_song_task(module, name, :custom, last_data, last_song, get_db_song_data(state))

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
          retries: retries,
          db_data: db_data,
          last_timestamp: last_timestamp
        } = state
      ) do
    Process.demonitor(ref, [:flush])
    {task_timestamp, updated_state} = pop_in(state.tasks[ref])

    with true <- is_nil(last_timestamp) or task_timestamp >= last_timestamp,
         updated_retries <- get_updated_retries(name, song, retries),
         false <- data == :error or match?({_, _, :error}, data),
         false <- song == :error do
      song = stamp_song(song, last_song)
      broadcast_song_if_needed(name, song, last_song, Map.get(db_data || %{}, :stream_ids))
      updated_song_history = update_song_history(last_song, song_history, song)

      broadcast_song_history_if_needed(
        name,
        updated_song_history,
        song_history,
        Map.get(db_data || %{}, :stream_ids)
      )

      update_status(song, db_data)

      how_many_connected =
        name
        |> Presence.list()
        |> map_size()

      next_refresh =
        cond do
          SongManager.persistent_topic?(name) == true and how_many_connected == 0 ->
            @refresh_song_interval_persistent_no_connected

          Kernel.function_exported?(module, :get_auto_refresh, 0) == true ->
            apply(module, :get_auto_refresh, [])

          apply(module, :has_custom_refresh, [state.name]) == true ->
            @refresh_song_interval_long

          true ->
            @refresh_song_interval
        end
        |> Kernel.+(Enum.random(-5000..5000))
        |> increment_interval(updated_retries)

      # as a function so the presence lookup is only done when the debug level is enabled
      Logger.debug(
        "Data provider - #{name}: song updated (timer, next: #{trunc(next_refresh / 1000)}s, retries: #{updated_retries}) - #{how_many_connected} clients connected"
      )

      Process.send_after(self(), {:refresh, :auto}, next_refresh)

      # special case: when icecast is indecisive (not sure what metadata pick if multiple)
      # we switch it to default (reading stream metadata)
      # should be only after the first :auto
      # we have to do it here because of the split get_data / get_song
      # todo revisit?
      # in case of the special case we trigger an immediate refresh, otherwise the regular rate
      {data, song} =
        case song do
          :indecisive ->
            Logger.debug("Data provider - #{name}: indecisive returned")
            Process.send_after(self(), {:refresh, :scheduled}, 250)
            {:indecisive, nil}

          _ ->
            {data, song}
        end

      {:noreply,
       %{
         updated_state
         | song: song,
           last_data: data,
           song_history: updated_song_history,
           retries: updated_retries,
           last_timestamp: SongProvider.now_unix(),
           db_data: db_data
       }, :hibernate}
    else
      _ ->
        broadcast_song(name, nil, Map.get(db_data || %{}, :stream_ids))

        # quitting if delay reached since last successful attempt
        if SongProvider.now_unix() - last_timestamp > @max_seconds_errors_before_quitting do
          ProgRadioApiWeb.Endpoint.broadcast!(state.name, "quit", %{})
          Logger.error("Data provider - #{state.name}: fetching error, exiting")
          kill_push_process_if_any(state.push_pid)
          {:stop, :normal, nil}
        else
          Logger.info("Data provider - #{state.name}: fetching error, no quitting")
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
          retries: retries,
          db_data: db_data,
          last_timestamp: last_timestamp
        } = state
      ) do
    Process.demonitor(ref, [:flush])
    {task_timestamp, updated_state} = pop_in(state.tasks[ref])

    with true <- is_nil(last_timestamp) or task_timestamp >= last_timestamp,
         updated_retries <- get_updated_retries(name, song, retries),
         false <- data == :error,
         false <- song == :error do
      song = stamp_song(song, last_song)
      broadcast_song_if_needed(name, song, last_song, Map.get(db_data || %{}, :stream_ids))
      updated_song_history = update_song_history(last_song, song_history, song)

      broadcast_song_history_if_needed(
        name,
        updated_song_history,
        song_history,
        Map.get(db_data || %{}, :stream_ids)
      )

      update_status(song, db_data)

      # the if is for :indecisive special case that triggers one refresh
      if apply(state.module, :has_custom_refresh, [state.name]) == true do
        next_refresh =
          apply(module, :get_refresh, [name, data, @refresh_song_interval]) ||
            @refresh_song_interval
            |> Kernel.+(Enum.random(-5..5))

        Logger.debug(
          "Data provider - #{name}: song updated, next update in #{trunc(next_refresh / 1000)} seconds"
        )

        Process.send_after(self(), {:refresh, :scheduled}, next_refresh)
      end

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

        Logger.info("Data provider - #{state.name}: fetching error")

        Process.send_after(self(), {:refresh, :scheduled}, next_refresh)

        {:noreply, updated_state}
    end
  end

#  %EventsourceEx.Message{
#    id: "1749399737229",
#    event: "message",
#    data:
#      "{\"mount\":\"s70bvdgqks8uv\",\"streamTitle\":\"Darren Styles, Dougal & Gammer - Party Don't Stop\"}",
#    dispatch_ts: ~U[2025-06-08 16:22:17.584931Z]
#  }

  # messages from the push client
  @impl true
  def handle_info(
        %EventsourceEx.Message{} = push_event,
        %{name: name, song: last_song, db_data: db_data} = state
      ) do
    IO.puts("#{inspect push_event}")
    {data, song} =
      case apply(state.module, :get_data, [name, push_event, state.last_data]) do
        nil ->
          {nil, nil}

        :error ->
          {:error, nil}

        data ->
          case apply(state.module, :get_song, [name, data, last_song]) do
            song when is_nil(song) or song == :error -> {data, nil}
            song -> {data, song}
          end
      end

    song = stamp_song(song, last_song)
    broadcast_song_if_needed(name, song, last_song, Map.get(db_data || %{}, :stream_ids))
    updated_song_history = update_song_history(last_song, state.song_history, song)

    broadcast_song_history_if_needed(
      name,
      updated_song_history,
      state.song_history,
      Map.get(db_data || %{}, :stream_ids)
    )

    update_status(song, state.db_data)

    {:noreply, %{state | song: song, last_data: data, song_history: updated_song_history},
     :hibernate}
  end

  @impl true
  def handle_info(:presence, %{name: name} = state) do
    presences = Presence.list(name)

    active_stream_ids =
      for {_key, %{metas: metas}} <- presences,
          %{stream_id: stream_id} <- metas,
          not is_nil(stream_id),
          uniq: true,
          do: stream_id

    state =
      put_in(state, [:db_data], Map.put(state.db_data || %{}, :stream_ids, active_stream_ids))

    case map_size(presences) do
      0 ->
        # most popular streams are pre-warmed and must stay alive without clients
        if SongManager.persistent_topic?(name) do
          Logger.debug(
            "Data provider - #{name}: no client connected but persistent, staying alive"
          )

          Process.send_after(
            self(),
            :presence,
            @refresh_presence_interval + Enum.random(-3000..3000)
          )

          {:noreply, state}
        else
          broadcast_song(name, nil, Map.get(state.db_data || %{}, :stream_ids))
          Logger.info("Data provider - #{name}: no client connected, exiting")
          kill_push_process_if_any(state.push_pid)
          {:stop, :normal, nil}
        end

      how_many_connected ->
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
    Logger.error("Task failed #{inspect(reason)}")
    kill_push_process_if_any(state.push_pid)
    {:noreply, %{state | tasks: Map.delete(state.tasks, ref)}}
  end

  # ----- Internal -----

  # never push internal markers (:indecisive, :error) to clients
  defp broadcast_song_if_needed(_name, song, _last_song, _stream_ids)
       when not is_map(song) and not is_nil(song),
       do: :ok

  defp broadcast_song_if_needed(name, %{} = song, %{} = last_song, stream_ids)
       when song !== last_song do
    broadcast_song(name, song, stream_ids)
  end

  defp broadcast_song_if_needed(name, song, _last_song, stream_ids) do
    # as safety, still broadcast % of the time
    if :rand.uniform(10) > 7, do: broadcast_song(name, song, stream_ids)

    Logger.debug("Data provider - #{name}: song updated, no broadcast")
  end

  @spec broadcast_song(String.t(), map() | nil, [String.t()] | nil) :: none()
  defp broadcast_song(name, song, stream_ids) do
    data = %{topic: name, name: name, song: song}

    # compat for old & new song channel
    if !is_nil(stream_ids) and is_list(stream_ids) and stream_ids != [] do
      Enum.each(stream_ids, fn stream_id ->
        ProgRadioApiWeb.Endpoint.broadcast!(
          "song_next:" <> stream_id,
          "playing",
          Map.put(data, :stream_id, stream_id)
        )

        Redix.command!(:redix, [
          "SET",
          "song_" <> stream_id,
          Jason.encode!(song),
          "EX",
          @song_ttl
        ])
      end)
    else
      ProgRadioApiWeb.Endpoint.broadcast!(
        name,
        "playing",
        data
      )
    end
  end

  #  defp broadcast_song_history_if_needed(name, song_history, _last_song_history, stream_ids)
  #       when length(song_history) < @max_song_history do
  #    broadcast_song_history(name, song_history, stream_ids)
  #  end

  defp broadcast_song_history_if_needed(name, song_history, last_song_history, stream_ids) do
    cond do
      song_history -- last_song_history == [] ->
        Logger.debug("Data provider - #{name}: song history updated, no broadcast")

      # near the end of a song, some streams metadata alternate between the current
      # song and the next one: a song coming back that quickly is not a new entry
      recent_song?(hd(song_history), last_song_history) ->
        Logger.debug("Data provider - #{name}: song already in recent history, no broadcast")

      true ->
        broadcast_song_history(name, song_history, stream_ids)
    end
  end

  defp recent_song?(song, song_history) do
    song = Map.delete(song, :detected_at)

    song_history
    |> Enum.take(@recent_song_history)
    |> Enum.any?(&(Map.delete(&1, :detected_at) == song))
  end

  @spec broadcast_song_history(String.t(), list, [String.t()] | nil) :: none()
  defp broadcast_song_history(name, song_history, stream_ids) do
    Redix.command!(:redix, [
      "SET",
      "history_" <> name,
      Jason.encode!(song_history),
      "EX",
      @history_ttl
    ])

    data = %{name: name, history: song_history, topic: name}

    # compat for old & new song channel
    if !is_nil(stream_ids) and is_list(stream_ids) and stream_ids != [] do
      Enum.each(stream_ids, fn stream_id ->
        ProgRadioApiWeb.Endpoint.broadcast!(
          "song_next:" <> stream_id,
          "song_history",
          Map.put(data, :stream_id, stream_id)
        )

        Redix.command!(:redix, [
          "SET",
          "history_" <> stream_id,
          Jason.encode!(song_history),
          "EX",
          @history_ttl
        ])
      end)
    else
      ProgRadioApiWeb.Endpoint.broadcast!(
        name,
        "song_history",
        data
      )
    end
  end

  @spec get_data_song_task(atom(), String.t(), atom(), map() | nil, map() | nil, map() | nil) ::
          tuple()
  defp get_data_song_task(module, name, refresh_type, last_data, last_song, db_song_data) do
    task =
      Task.Supervisor.async_nolink(TaskSupervisor, fn ->
        try do
          task_data =
            Task.Supervisor.async(TaskSupervisor, module, :get_data, [
              name,
              last_data,
              db_song_data
            ])

          data = Task.await(task_data, @task_timeout)

          song =
            case data do
              :error ->
                nil

              nil ->
                nil

              {_, _, :error} ->
                nil

              {_, _, nil} ->
                nil

              _ ->
                task_song =
                  Task.Supervisor.async(TaskSupervisor, module, :get_song, [name, data, last_song])

                Task.await(task_song, @task_timeout)
                # apply(module, :get_song, [name, data])
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

  # song_data of the stream that started the server (the "url:" topic of the old channel has no db data)
  defp get_db_song_data(state), do: Map.get(state.db_data || %{}, :song_data)

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

  defp kill_push_process_if_any(push_pid) when is_nil(push_pid), do: :ok
  defp kill_push_process_if_any(push_pid), do: Process.exit(push_pid, :kill)

  # ---------- UPDATE STATUS ----------

  @spec update_status(map() | nil, map() | nil) :: any()
  defp update_status(song, db_data)

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

  # ---------- SONG DETECTION TIME ----------

  # ISO 8601 string (so live songs equal songs restored from Redis JSON)
  @spec stamp_song(map() | atom() | nil, map() | atom() | nil) :: map() | atom() | nil
  defp stamp_song(song, last_song)

  # same song as before (ignoring the timestamp): keep its original detection time
  defp stamp_song(%{} = song, %{} = last_song) when map_size(song) > 0 do
    if Map.delete(song, :detected_at) == Map.delete(last_song, :detected_at),
      do: Map.put(song, :detected_at, Map.get(last_song, :detected_at)),
      else: Map.put(song, :detected_at, DateTime.utc_now() |> DateTime.to_iso8601())
  end

  defp stamp_song(%{} = song, _last_song) when map_size(song) > 0,
    do: Map.put(song, :detected_at, DateTime.utc_now() |> DateTime.to_iso8601())

  # nil, :error, :indecisive, %{}
  defp stamp_song(song, _last_song), do: song

  # ---------- SONG HISTORY ----------

  @spec update_song_history(map() | nil, list, map() | nil) :: list
  defp update_song_history(song, song_history, new_song)

  # no song to add
  defp update_song_history(:indecisive, song_history, _new_song), do: song_history

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
    with {:ok, history} when is_binary(history) <-
           Redix.command(:redix, ["GET", "history_" <> name]),
         {:ok, songs} when is_list(songs) <- JSON.decode(history) do
      songs
      |> Enum.filter(&is_map/1)
      |> Enum.map(&restore_song/1)
    else
      _ -> []
    end
  end

  # atom keys like live songs, only known keys (no atom creation from external data)
  defp restore_song(song) do
    for {json_key, key} <- @song_keys,
        Map.has_key?(song, json_key),
        into: %{},
        do: {key, song[json_key]}
  end

  defp increment_interval(_base_refresh, retries) when retries >= @refresh_song_retries_max,
    do: @refresh_song_retries_max_interval

  defp increment_interval(base_refresh, retries),
    do: base_refresh + @refresh_song_retries_increment * retries

  defp get_url_module(song_topic) do
    # sorted by prevalence in db
    cond do
      String.contains?(song_topic, ".zeno.fm") ->
        ProgRadioApi.SongProvider.Zeno

      String.contains?(song_topic, ".streamtheworld.com") ->
        ProgRadioApi.SongProvider.Streamtheworld

      String.contains?(song_topic, "ice.infomaniak.ch") ->
        ProgRadioApi.SongProvider.Infomaniak

      String.match?(song_topic, ~r/live365[^\/]*\/a\d+/) ->
        ProgRadioApi.SongProvider.Live365

      String.contains?(song_topic, ".laut.fm") ->
        ProgRadioApi.SongProvider.Lautfm

      String.contains?(song_topic, ".securenetsystems.net") ->
        ProgRadioApi.SongProvider.Securenetsystems

      String.contains?(song_topic, ".radio.co/") ->
        ProgRadioApi.SongProvider.RadioCo

      String.contains?(song_topic, ".radioking.") ->
        ProgRadioApi.SongProvider.Radioking

      # {station id}_{bitrate} mounts only (not broadcastify's (police/fire stations) or hls ones)
      # cdnstream.com and streamon.fm are the same platform
      String.match?(
        song_topic,
        ~r/\.(?:cdnstream1?\.com|streamon\.fm)\/\d+_\d+k?(?:\.aac|\.mp3)?(?:[?;]|$)/
      ) ->
        ProgRadioApi.SongProvider.Cdnstream1

      # site channels streams (pro, trust, air), not the personal or regional ones
      String.match?(
        song_topic,
        ~r/101\.ru(?::\d+)?\/stream\/(?:pro|trust|air)\/[^\/]+\/\d+\/\d+(?:[?\/]|$)/
      ) ->
        ProgRadioApi.SongProvider.Ru101

      # only the townsquare stations have the station id (song data, see Importer.StreamEnhancer)
      # before the hls one, the module falls back to it (or icecast) without the station id
      String.contains?(song_topic, "amperwave.net") and
          String.contains?(song_topic, "/townsquare-") ->
        ProgRadioApi.SongProvider.Amperwave

      String.match?(song_topic, ~r/\/azura.*\/listen\/[a-zA-Z0-9_-]+(\/.*)?/) ->
        ProgRadioApi.SongProvider.Azuracast

      String.match?(song_topic, ~r/revma\..*\/zc\d+/) ->
        ProgRadioApi.SongProvider.Revma

      String.contains?(song_topic, ".out.airtime.pro") ->
        ProgRadioApi.SongProvider.AirtimePro

      String.contains?(song_topic, ".radiojar.com") ->
        ProgRadioApi.SongProvider.Radiojar

      String.contains?(song_topic, ".rcast.net") ->
        ProgRadioApi.SongProvider.Rcast

      #      String.contains?(song_topic, ".creacast.com/") ->
      #        ProgRadioApi.SongProvider.Creacast

      # known sonicpanel hosts, proxied (host/{port}/stream) or direct (host:{port}/) streams
      String.contains?(song_topic, ["sonicpanel", "sonic.host-live.com"]) and
          String.match?(
            song_topic,
            ~r/^url:https?:\/\/[^\/]+(?::\d{4}\/|\/\d{4,5}\/(?:stream|;|live|$))/
          ) ->
        ProgRadioApi.SongProvider.Sonicpanel

      String.contains?(song_topic, "streaming.nrjaudio.fm") ->
        ProgRadioApi.SongProvider.Nrjstreaming

      String.contains?(song_topic, ".surfernetwork.com/") ->
        ProgRadioApi.SongProvider.Zeno

      # legacy zeno domain, same mount ids
      String.contains?(song_topic, ".zenolive.com/") ->
        ProgRadioApi.SongProvider.Zeno

      String.contains?(song_topic, ".radioboss.fm") ->
        ProgRadioApi.SongProvider.Radioboss

      String.match?(song_topic, ~r/myradio24\.(?:com|org)(?::\d+)?\/\d+(?:[_?\/]|$)/) ->
        ProgRadioApi.SongProvider.Myradio24

      String.match?(song_topic, ~r/[\/.]2stream\.net(?::\d+)?\/[^\/?]+/) ->
        ProgRadioApi.SongProvider.Twostream

      String.contains?(song_topic, ".radioca.st") ->
        ProgRadioApi.SongProvider.Radiocast

      String.contains?(song_topic, ".mexside.net") ->
        ProgRadioApi.SongProvider.Mexside

      String.contains?(song_topic, ".ssl-stream.com/") ->
        ProgRadioApi.SongProvider.SslStream

      String.contains?(song_topic, "//0n-") and
          String.contains?(song_topic, ".radionetz.de/") ->
        ProgRadioApi.SongProvider.Radio0n

      String.contains?(song_topic, ".m3u8") ->
        ProgRadioApi.SongProvider.Hls

      # azuracast on any host (/listen/{station}/{file}), the module falls back to the stream metadata if it is not one
      String.match?(song_topic, ~r/\/listen\/[^\/?]+\/[^\/?]+/) ->
        ProgRadioApi.SongProvider.Azuracast

      # centova cast proxied streams (https://host/proxy/{username}), the module falls back to icecast if it is not one
      String.match?(song_topic, ~r/^url:https?:\/\/[^\/]+\/+proxy\/[^\/?]+/) ->
        ProgRadioApi.SongProvider.Centova

      true ->
        ProgRadioApi.SongProvider.Icecast
    end
  end
end
