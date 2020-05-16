defmodule Importer.Supervisor do
  use Supervisor

  require Application
  require Logger
  require Redix

  def start_link do
    Logger.info("Starting the supervisor ...")
    Supervisor.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  def init(:ok) do
    children = [
      {Redix,
       host: Application.get_env(:importer, :redis_host),
       database: Application.get_env(:importer, :redis_db),
       name: :redix},
      Importer.Repo,
      {Task.Supervisor, name: Importer.TaskSupervisor},
      Importer.ProcessorMonitor,
      Importer.Queue,
      Importer.Scheduler
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
