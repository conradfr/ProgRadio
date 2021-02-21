defmodule ProgRadioApi.Repo do
  use Ecto.Repo,
    otp_app: :progradio_api,
    adapter: Ecto.Adapters.Postgres
end
