defmodule Importer.Queue do
  use GenServer

  require Logger

  @name :queue_server

  @queue_list "schedule_input:queue"
  @queue_processing "schedule_input:processing"
  # in ms
  @queue_cleaning_interval 30 * 60 * 1000
  # in ms
  @queue_polling_interval 5000

  # ----- Client Interface -----

  def start_link(_arg) do
    Logger.info("Starting the queue ...")
    GenServer.start_link(__MODULE__, :ok, name: @name)
  end

  def key_processed(key, date, radio_name) do
    GenServer.cast(@name, {:key_processed, key, date, radio_name})
  end

  # ----- Server callbacks -----

  def init(:ok) do
    Logger.info("Cleaning processing queue (init)")
    clean()
    query_queue()
    schedule_clean()
    schedule_loop()
    {:ok, nil}
  end

  def handle_info(:poll, _state) do
    query_queue()
    schedule_loop()
    {:noreply, nil}
  end

  def handle_info(:clean, _state) do
    Logger.info("Cleaning processing queue")
    clean()
    schedule_clean()
    {:noreply, nil}
  end

  @spec handle_cast(tuple, any) :: no_return
  def handle_cast({:key_processed, key, date, radio_name}, _state) do
    Logger.info("Processed: " <> key)

    if date !== nil and radio_name !== nil do
      Importer.ScheduleCache.remove(date, radio_name)
    end

    case Redix.command(:redix, ["LREM", @queue_processing, 1, key]) do
      {:ok, _} -> Redix.command(:redix, ["DEL", key])
      {:error, reason} -> Logger.warn("#{inspect(reason)}")
    end

    {:noreply, nil}
  end

  # Polling

  defp schedule_loop do
    Process.send_after(self(), :poll, @queue_polling_interval)
  end

  def query_queue() do
    case Redix.command(:redix, ["RPOPLPUSH", @queue_list, @queue_processing]) do
      {:ok, key} when is_binary(key) ->
        Logger.info("Entry: " <> key)
        Importer.ProcessorMonitor.process_entry(key)
        query_queue()

      {:error, reason} ->
        Logger.warn("#{inspect(reason)}")

      _ ->
        nil
    end

    {:ok, nil}
  end

  # Cleaning

  defp schedule_clean do
    Process.send_after(self(), :clean, @queue_cleaning_interval)
  end

  defp clean do
    case Redix.command(:redix, ["RPOPLPUSH", @queue_processing, @queue_list]) do
      {:ok, key} when is_binary(key) -> clean()
      {:error, reason} -> Logger.warn("#{inspect(reason)}")
      _ -> nil
    end

    {:ok, nil}
  end
end
