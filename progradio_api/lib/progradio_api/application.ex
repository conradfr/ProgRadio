defmodule ProgRadioApi.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    children = [
      ProgRadioApi.Cache,
      # Start the Ecto repository
      ProgRadioApi.Repo,
      # Start the Telemetry supervisor
      ProgRadioApiWeb.Telemetry,
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
      {Registry, [keys: :unique, name: SongSongProviderRegistry]},
      {DynamicSupervisor, strategy: :one_for_one, name: ProgRadioApi.SongDynamicSupervisor},
      # Start the Endpoint (http/https)
      ProgRadioApiWeb.Endpoint,
      ProgRadioApi.Scheduler,
      ProgRadioApi.Checker.StreamsSupervisor
      # Start a worker by calling: ProgRadioApi.Worker.start_link(arg)
      # {ProgRadioApi.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: ProgRadioApi.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    ProgRadioApiWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
