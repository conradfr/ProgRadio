defmodule ProgRadioApi.ApiUser do
  use Ecto.Schema
  alias ProgRadioApi.ApiKey

  schema "api_user" do
    field(:name, :string)
    field(:enabled, :boolean)
    field(:created_at, :utc_datetime)
    field(:deleted_at, :utc_datetime)
    has_many(:api_key, ApiKey)
  end
end

defimpl Canada.Can, for: ProgRadioApi.ApiUser do
  def can?(api_user, action, radio)
      when action in [:add, :update] do
    true
  end
end
