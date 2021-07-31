defmodule ProgRadioApi.ApiKey do
  use Ecto.Schema
  alias ProgRadioApi.ApiUser
  alias ProgRadioApi.ApiKeyRight

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "api_key" do
    field(:enabled, :boolean)
    field(:created_at, :utc_datetime)
    field(:deleted_at, :utc_datetime)
    belongs_to(:api_user, ApiUser)
    has_many(:api_key_right, ApiKeyRight)
  end
end

defimpl Canada.Can, for: ProgRadioApi.ApiKey do
  alias ProgRadioApi.Repo

  @schedule_type "schedule"
  @schedule_action "add"

  def can?(api_key, action, radio)
      when action in [:add, :update] do
    check_radio(api_key.api_user, radio) and check_right(api_key)
  end

  # Step 1 : check if radio is allowed for this user
  defp check_radio(api_key_user, radio) do
    radios =
      api_key_user
      |> Repo.preload(:radio)
      |> Map.get(:radio)
      |> Enum.any?(fn e ->
        e.id == radio.id
      end)
  end

  # Step 2 : check if key is allowed to write schedules
  defp check_right(api_key) do
    Repo.preload(api_key, :api_key_right)
    |> Map.get(:api_key_right)
    |> Enum.any?(fn e ->
      e.type == @schedule_type and e.action == @schedule_action
    end)
  end
end
