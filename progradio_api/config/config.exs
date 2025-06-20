# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :elixir, :time_zone_database, Tzdata.TimeZoneDatabase

config :progradio_api,
  namespace: ProgRadioApi,
  ecto_repos: [ProgRadioApi.Repo],
  generators: [timestamp_type: :utc_datetime]

# Configures the endpoint
config :progradio_api, ProgRadioApiWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [json: ProgRadioApiWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: ProgRadioApi.PubSub,
  live_view: [signing_salt: "blb3VG44"]

config :progradio_api, ProgRadioApi.Scheduler,
  timezone: "Europe/Paris",
  jobs: [
    radio_streams_check: [
      schedule: "25 */2 * * *",
      task: {ProgRadioApi.Checker.RadioStreams, :check, []}
    ],
    radio_streams_auto_update: [
      schedule: "32 */2 * * *",
      task: {ProgRadioApi.AutoUpdater.RadioStreams, :auto_update, []}
    ],
    import: [
      schedule: "10 02 */2 * *",
      task: {ProgRadioApi.Importer.StreamsImporter.RadioBrowser, :import, []}
    ],
    stats: [
      schedule: "40 01 */1 * *",
      task: {ProgRadioApi.Streams, :update_stats, []}
    ],
    search_term_switch: [
      schedule: "12 0 */1 * *",
      task: {ProgRadioApi.Streams, :switch_search_terms_day, []}
    ],
    import_overload: [
      schedule: "15,45 * * * *",
      task: {ProgRadioApi.Importer.StreamsImporter.RadioBrowser, :overload_recently_updated, []}
    ],
    import_img_progradio_source: [
      schedule: "35 * * * *",
      task: {ProgRadioApi.Importer.StreamsImporter.RadioBrowser, :progradio_source_img, []}
    ],
    warm_radios_cache: [
      schedule: "14 0,12 * * *",
      task: {ProgRadioApi.Radios, :list_active_radios, []}
    ],
    warm_schedule_cache: [
      schedule: "15 0,12 * * *",
      task: {ProgRadioApi.Schedule, :list_schedule, []}
    ]
  ]

# Configures the mailer
#
# By default it uses the "Local" adapter which stores the emails
# locally. You can see the emails in your browser, at "/dev/mailbox".
#
# For production it's recommended to configure a different adapter
# at the `config/runtime.exs`.
config :progradio_api, ProgRadioApi.Mailer, adapter: Swoosh.Adapters.Local

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :logger,
  compile_time_purge_matching: [[application: :remote_ip]]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

#  System.get_env("CORS", ".*")
{:ok, origin} =
  System.get_env(
    "CORS",
    "https?.*(programmes-radio\.com|radio-addict\.com|localhost|localhost:4001)"
  )
  |> Regex.compile()

config :cors_plug,
  origin: [origin],
  max_age: 86400,
  methods: ["GET", "POST", "PUT", "OPTIONS"]

# Configure redis
config :progradio_api,
  image_path: "/var/www/progradio/public/media/",
  banned_ips: "" |> String.split(","),
  redis_host: System.get_env("REDIS_HOST") || "127.0.0.1",
  redis_db: "0"

# Configure meilsearch
config :progradio_api,
  meilisearch_url: System.get_env("MEILISEARCH_URL") || "http://meilisearch:7700",
  meilisearch_api_key:
    System.get_env("MEILISEARCH_API_KEY") || "sz2d5xeGLME2fDW53tGnuJsEX3L2Q9Xz",
  meilisearch_prefix: System.get_env("MEILISEARCH_PREFIX") || "dev_"

config :hackney, use_default_pool: false

config :progradio_api, ProgRadioApiWeb.Gettext,
  default_locale: "en",
  locales: ~w(fr en es de pt it el pl ar hu tr)

config :ex_cldr,
  default_locale: "en",
  default_backend: ProgRadioApi.Cldr

config :progradio_api, ProgRadioApi.Cache,
  stats: true,
  # When using :shards as backend
  # backend: :shards,
  # GC interval for pushing new generation: 12 hrs
  gc_interval: :timer.hours(1),
  # Max 1 million entries in cache
  max_size: 1_000_000,
  # Max 2 GB of memory
  allocated_memory: 4_000_000_000,
  # GC min timeout: 10 sec
  gc_cleanup_min_timeout: :timer.seconds(30),
  # GC min timeout: 10 min
  gc_cleanup_max_timeout: :timer.minutes(10)

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
