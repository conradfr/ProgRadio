defmodule Importer.QueueConsumer do
  use GenStage

  require Logger

  def start_link() do
    GenStage.start_link(__MODULE__, :ok)
  end

  def init(:ok) do
    {:consumer, :the_state_does_not_matter, subscribe_to: [Importer.QueueProducer]}
  end

  def handle_events(events, _from, _state) do
    Logger.info("event !")
    for event <- events do
      IO.inspect({self(), event})
    end

    # As a consumer we never emit events
    {:noreply, [], :the_state_does_not_matter}
  end
end
