defmodule ProgRadioApi.Checker.Streams.Consumer do
  use ConsumerSupervisor
  alias ProgRadioApi.Checker.Streams.Producer
  alias ProgRadioApi.Checker.Streams.StreamTask

  @max_demand 3

  def start_link(_opts) do
    ConsumerSupervisor.start_link(__MODULE__, :ok)
  end

  def init(:ok) do
    # Note: By default the restart for a child is set to :permanent
    # which is not supported in ConsumerSupervisor. You need to explicitly
    # set the :restart option either to :temporary or :transient.
    children = [
      %{id: StreamTask, start: {StreamTask, :start_link, []}, restart: :transient}
    ]

    opts = [strategy: :one_for_one, subscribe_to: [{Producer, max_demand: @max_demand}]]
    ConsumerSupervisor.init(children, opts)
  end
end
