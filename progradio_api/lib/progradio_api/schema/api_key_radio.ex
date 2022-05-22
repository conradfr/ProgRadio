defmodule ProgRadioApi.ApiKeyRadio do
  use Ecto.Schema
  alias ProgRadioApi.ApiKey
  alias ProgRadioApi.Radio

  @primary_key false

  schema "api_key_radio" do
    belongs_to(:api_key, ApiKey)
    belongs_to(:radio, Radio)
  end
end
