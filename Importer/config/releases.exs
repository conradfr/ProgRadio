import Config

# Configure your database
config :importer, Importer.Repo,
  url: System.get_env("DB_URL"),
  show_sensitive_data_on_connection_error: true

# Configure redis
config :importer,
  image_path: "/var/media/",
  redis_host: System.get_env("REDIS_HOST"),
  redis_db: System.get_env("REDIS_DB"),
  redis_password: System.get_env("REDIS_PASSWORD")
