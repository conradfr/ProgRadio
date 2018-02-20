defmodule Importer.ProcessorMonitor do
  use GenServer

  require Logger

  @name :process_monitor

  # ----- Client interface -----

  def start_link(_arg) do
    Logger.info "Starting the processor monitor ..."
    GenServer.start_link(__MODULE__, :ok, name: @name)
  end

  def process_entry(key) do
    GenServer.cast @name, {:entry, key}
    :ok
  end

  def processed_entry(key, date, radio) do
    Importer.Queue.key_processed(key, date, radio)
  end

  # ----- Server callbacks -----

  def init(:ok) do
    {:ok, nil}
  end

  def handle_cast({:entry, key}, _state) do
    Task.Supervisor.start_child(Importer.TaskSupervisor, fn -> Importer.Processor.process(key) end)
    {:noreply, nil}
  end
end
