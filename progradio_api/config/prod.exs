import Config

# For production, don't forget to configure the url host
# to something meaningful, Phoenix uses this information
# when generating URLs.

# Configures Swoosh API Client
config :swoosh, api_client: Swoosh.ApiClient.Finch, finch_name: ProgRadioApi.Finch

# Do not print debug messages in production
config :logger, level: :info

# Runtime production configuration, including reading
# of environment variables, is done on config/runtime.exs.

config :progradio_api, Oban,
  plugins: [
    {Oban.Plugins.Pruner, max_age: 300},
    {Oban.Plugins.Cron,
     crontab: [
       {"0 4 2 * *", ProgRadioApi.EmailStatsCronWorker, queue: :cron, max_attempts: 2},
       {"* * * * *", ProgRadioApi.ImporterWeLoveRadioCronWorker, queue: :cron, max_attempts: 2}
     ]}
  ]
