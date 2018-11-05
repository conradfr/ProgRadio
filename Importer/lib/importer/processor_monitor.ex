defmodule Importer.ProcessorMonitor do
  use GenServer

  require Logger

  @name :process_monitor

  # ----- Client interface -----

  def start_link(_arg) do
    Logger.info("Starting the processor monitor ...")
    GenServer.start_link(__MODULE__, :ok, name: @name)
  end

  @spec process_entry(String.t()) :: atom
  def process_entry(key) do
    GenServer.cast(@name, {:entry, key})
    :ok
  end

  @spec processed_entry(String.t(), Date.t() | nil, String.t() | nil) :: any
  def processed_entry(key, date, radio_name) do
    Importer.Queue.key_processed(key, date, radio_name)
  end

  # ----- Server callbacks -----

  def init(:ok) do
    {:ok, nil}
  end

  def handle_cast({:entry, key}, _state) do
    Task.Supervisor.start_child(Importer.TaskSupervisor, fn ->
      Importer.Processor.Processor.process(key)
    end)

    {:noreply, nil}
  end
end
