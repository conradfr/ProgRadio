defmodule ProgRadioApi.ApiUserRadio do
  use Ecto.Schema
  alias ProgRadioApi.ApiUser
  alias ProgRadioApi.Radio

  @primary_key false

  schema "api_user_radio" do
    belongs_to(:api_user, ApiUser)
    belongs_to(:radio, Radio)
  end
end
