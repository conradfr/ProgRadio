# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :elixir, :time_zone_database, Tzdata.TimeZoneDatabase

config :progradio_api,
  namespace: ProgRadioApi,
  ecto_repos: [ProgRadioApi.Repo]

# Configures the endpoint
config :progradio_api, ProgRadioApiWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "AR9JT6+oU/tgmN46k4MfK8IJvZmVm2bPJcMmCGTEHw8TzgInAs6SKVaHxx4wR9Gc",
  render_errors: [view: ProgRadioApiWeb.ErrorView, accepts: ~w(json), layout: false],
  pubsub_server: ProgRadioApi.PubSub,
  live_view: [signing_salt: "LI4gelTF"]

config :progradio_api, ProgRadioApi.Scheduler,
  timezone: "Europe/Paris",
  jobs: [
    check: [
      schedule: "14 */2 * * *",
      task: {ProgRadioApi.Checker.Streams, :check, []}
    ],
    import: [
      schedule: "32 */12 * * *",
      task: {ProgRadioApi.Importer.StreamsImporter.RadioBrowser, :import, []}
    ],
    warm_radios_cache: [
      schedule: "9 0,12 * * *",
      task: {ProgRadioApi.Radios, :list_active_radios, []}
    ],
    warm_schedule_cache: [
      schedule: "10 0,12 * * *",
      task: {ProgRadioApi.Schedule, :list_schedule, []}
    ]
  ]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :logger,
  compile_time_purge_matching: [[application: :remote_ip]]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

{:ok, origin} =
  System.get_env("CORS", ".*")
  |> Regex.compile()

config :cors_plug,
  origin: [origin],
  max_age: 86400,
  methods: ["GET", "POST", "OPTIONS"]

# Configure redis
config :progradio_api,
  image_path: "/var/www/progradio/public/media/",
  redis_host: "127.0.0.1",
  redis_db: "0"

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
