use Mix.Config

# Configure your database
#
# The MIX_TEST_PARTITION environment variable can be used
# to provide built-in test partitioning in CI environment.
# Run `mix help test` for more information.
config :progradio_api, ProgRadioApi.Repo,
  username: "postgres",
  password: "123",
  database: "progradio_api_test#{System.get_env("MIX_TEST_PARTITION")}",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :progradio_api, ProgRadioApiWeb.Endpoint,
  http: [port: 4002],
  secret_key_base: "vtEZ8VazcB8inLfW8yhvbRSnuWn4pbig3Q4zB+ablJtka2tvCHi+0wV8EQo8C05y",
  server: false

# Print only warnings and errors during test
config :logger, level: :warn

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime
