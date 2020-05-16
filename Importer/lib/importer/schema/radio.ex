defmodule Importer.Radio do
  use Ecto.Schema
  import Ecto.Changeset

  schema "radio" do
    field(:code_name, :string)
    field(:active, :boolean)
    field(:streaming_url, :string)
    field(:streaming_enabled, :boolean)
    field(:streaming_status, :boolean)
    field(:streaming_retries, :integer)
    has_many(:schedule_entry, Importer.ScheduleEntry)
  end

  def update_streaming_changeset(radio, params \\ %{}) do
    radio
    |> cast(params, [:streaming_status, :streaming_retries])
    |> validate_required([:streaming_status, :streaming_retries])
  end
end
