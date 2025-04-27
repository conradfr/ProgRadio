defmodule ProgRadioApi.Checker.RadioStreams.Consumer do
  use ConsumerSupervisor
  alias ProgRadioApi.Checker.RadioStreams.Producer
  alias ProgRadioApi.Checker.RadioStreams.RadioStreamTask

  def start_link(arg) do
    ConsumerSupervisor.start_link(__MODULE__, arg)
  end

  def init(_arg) do
    # Note: By default the restart for a child is set to :permanent
    # which is not supported in ConsumerSupervisor. You need to explicitly
    # set the :restart option either to :temporary or :transient.
    children = [%{id: RadioStreamTask, start: {RadioStreamTask, :start_link, []}, restart: :transient}]
    opts = [strategy: :one_for_one, subscribe_to: [{Producer, max_demand: 5}]]
    ConsumerSupervisor.init(children, opts)
  end
end
