import Config

if config_env() == :prod do
  database_url =
    System.get_env("DATABASE_URL") ||
      raise """
      environment variable DATABASE_URL is missing.
      For example: ecto://USER:PASS@HOST/DATABASE
      """

  # Configure your database
  config :progradio_api, ProgRadioApi.Repo,
    url: database_url,
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
    timeout: 100_000,
    ownership_timeout: 100_000

  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise """
      environment variable SECRET_KEY_BASE is missing.
      You can generate one by calling: mix phx.gen.secret
      """

  config :progradio_api, ProgRadioApiWeb.Endpoint,
    server: true,
    http: [
      port: String.to_integer(System.get_env("PORT") || "4000")
      #    transport_options: [socket_opts: [:inet6]]
    ],
    check_origin: [System.get_env("ORIGIN")],
    secret_key_base: secret_key_base,
    url: [host: System.get_env("HOST"), port: 443, scheme: "https"]

  # Configure redis
  config :progradio_api,
    redis_host: System.get_env("REDIS_HOST"),
    redis_db: System.get_env("REDIS_DB"),
    redis_password: System.get_env("REDIS_PASSWORD")

  config :progradio_api,
    image_path: System.get_env("MEDIA_PATH")
end
