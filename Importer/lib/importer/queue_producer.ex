defmodule Importer.QueueProducer do
  use GenStage

  require Logger

  @queue_list "schedule_input:queue"
  @queue_processing "schedule_input:processing"

  def start_link(initial \\ 0) do
    Logger.info("Starting the queue producer ...")
    GenStage.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  def init(:ok), do: {:producer, :ok}

  def handle_demand(demand, _state) do
    Logger.info("demand !")
    Logger.info("#{inspect demand}")
    {:noreply, ["kikoo"], :ok}
#    with {:ok, key} when is_binary(key) <- Redix.command(:redix, ["RPOPLPUSH", @queue_list, @queue_processing])
#      do
#        Logger.info("key !")
#        {:noreply, [key], :ok}
#      else
#        _ -> {:noreply, ["kikoo"], :ok}
#      end
  end
end
