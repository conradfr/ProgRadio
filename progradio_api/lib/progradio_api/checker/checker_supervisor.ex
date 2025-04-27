defmodule ProgRadioApi.Checker.CheckerSupervisor do
  # Automatically defines child_spec/1
  use Supervisor

  def start_link(init_arg) do
    Supervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  @impl true
  def init(_init_arg) do
    children = [
      ProgRadioApi.Checker.RadioStreams.Producer,
      ProgRadioApi.Checker.RadioStreams.Consumer
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
