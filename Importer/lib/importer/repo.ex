defmodule Importer.Repo do
  use Ecto.Repo,
    otp_app: :importer,
    adapter: Ecto.Adapters.Postgres
end
