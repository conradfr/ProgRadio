defmodule Importer.RadioStream do
  use Ecto.Schema
  import Ecto.Changeset

  schema "radio_stream" do
    field(:code_name, :string)
    field(:url, :string)
    field(:enabled, :boolean)
    field(:status, :boolean)
    field(:retries, :integer)
    belongs_to(:radio, Importer.Radio)
  end

  def update_streaming_changeset(radio_stream, params \\ %{}) do
    radio_stream
    |> cast(params, [:status, :retries])
    |> validate_required([:status, :retries])
  end
end
