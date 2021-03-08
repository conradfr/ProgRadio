defmodule ProgRadioApi.RadioStream do
  use Ecto.Schema
  import Ecto.Changeset
  alias ProgRadioApi.Radio
  alias ProgRadioApi.ListeningSession

  schema "radio_stream" do
    field(:code_name, :string)
    field(:name, :string)
    field(:url, :string)
    field(:enabled, :boolean)
    field(:main, :boolean)
    field(:current_song, :boolean)
    field(:status, :boolean)
    field(:retries, :integer)
    belongs_to(:radio, Radio)
    has_many(:listening_session, ListeningSession)
  end

  def update_streaming_changeset(radio_stream, params \\ %{}) do
    radio_stream
    |> cast(params, [:status, :retries])
    |> validate_required([:status, :retries])
  end
end
