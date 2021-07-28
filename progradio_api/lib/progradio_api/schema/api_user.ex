defmodule ProgRadioApi.ApiUser do
  use Ecto.Schema
  alias ProgRadioApi.ApiKey
  alias ProgRadioApi.Radio

  schema "api_user" do
    field(:name, :string)
    field(:enabled, :boolean)
    field(:created_at, :utc_datetime)
    field(:deleted_at, :utc_datetime)
    has_many(:api_key, ApiKey)
    many_to_many :radio, Radio, join_through: "api_user_radio"
  end
end
