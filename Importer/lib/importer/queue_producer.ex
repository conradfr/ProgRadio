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

  def handle_demand(_demand, _state) do
    case Redix.command(:redix, ["RPOPLPUSH", @queue_list, @queue_processing]) do
      {:ok, key} when is_binary(key) ->
        Logger.info(key)
        {:noreply, [key], :ok}
      {:error, reason} ->
        Logger.warn("#{inspect(reason)}")
      _ ->
        {:noreply, ["kikoo"], :ok}
    end
  end
end
