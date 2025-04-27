defmodule ProgRadioApi.RadioStreamUpdate do
  use Ecto.Schema
  import Ecto.Changeset
  alias ProgRadioApi.RadioStream

  schema "radio_stream_update" do
    field(:type, :string)
    field(:url, :string)
    field(:path, :string)
    field(:last_successful_run, :utc_datetime)
    field(:last_failed_run, :utc_datetime)
#    field(:enabled, :boolean)
    belongs_to(:radio_stream, RadioStream)
  end

  def update_run(radio_stream_update, params \\ %{}) do
    radio_stream_update
    |> cast(params, [:last_successful_run, :last_failed_run])
  end
end
