defmodule ProgRadioApi.ApiKey do
  use Ecto.Schema
  alias ProgRadioApi.ApiUser

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "api_key" do
    field(:enabled, :boolean)
    field(:created_at, :utc_datetime)
    field(:deleted_at, :utc_datetime)
    belongs_to(:api_user, ApiUser)
  end
end
