defmodule ProgRadioApi.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      ProgRadioApiWeb.Telemetry,
      ProgRadioApi.Cache,
      ProgRadioApi.Repo,
      {DNSCluster, query: Application.get_env(:progradio_api, :dns_cluster_query) || :ignore},
      {Redix,
       host: Application.get_env(:progradio_api, :redis_host),
       database: Application.get_env(:progradio_api, :redis_db),
       password: Application.get_env(:progradio_api, :redis_password),
       name: :redix},
      {Task.Supervisor, name: ProgRadioApi.TaskSupervisor},
      {ProgRadioApi.Importer.ScheduleImporter, []},
      # Start the PubSub system
      {Phoenix.PubSub, name: ProgRadioApi.PubSub},
      ProgRadioApiWeb.Presence,
      {Registry, [keys: :unique, name: SongProviderRegistry]},
      {DynamicSupervisor,
       strategy: :one_for_one,
       max_restarts: 20,
       max_seconds: 1,
       name: ProgRadioApi.SongDynamicSupervisor},
      ProgRadioApi.ListenersCounter,
      # Start the Finch HTTP client for sending emails
      {Finch, name: ProgRadioApi.Finch},
      # Start a worker by calling: ProgRadioApi.Worker.start_link(arg)
      # {ProgRadioApi.Worker, arg}
      # Start to serve requests, typically the last entry
      ProgRadioApiWeb.Endpoint,
      ProgRadioApi.Scheduler,
      ProgRadioApi.Checker.StreamsSupervisor
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: ProgRadioApi.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    ProgRadioApiWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
