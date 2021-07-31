defmodule ProgRadioApi.ApiKeyRight do
  use Ecto.Schema
  alias ProgRadioApi.ApiKey

  @primary_key false
  @foreign_key_type Ecto.UUID

  schema "api_key_right" do
    belongs_to(:api_key, ApiKey, primary_key: true)
    field(:type, :string, primary_key: true)
    field(:action, :string, primary_key: true)
    field(:created_at, :utc_datetime)
    field(:deleted_at, :utc_datetime)
  end
end
