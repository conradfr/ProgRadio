defmodule ProgRadioApi.StreamAutoUpdate do
  use Ecto.Schema
  import Ecto.Changeset
  alias ProgRadioApi.Stream

  schema "stream_auto_update" do
    field(:type, :string)
    field(:url, :string)
    field(:path, :string)
    field(:last_successful_run, :utc_datetime)
    field(:last_failed_run, :utc_datetime)
    #    field(:enabled, :boolean)
    belongs_to(:stream, Stream, type: :binary_id)
  end

  def update_run(stream_auto_update, params \\ %{}) do
    stream_auto_update
    |> cast(params, [:last_successful_run, :last_failed_run])
  end
end
