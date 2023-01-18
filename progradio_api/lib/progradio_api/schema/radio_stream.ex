defmodule ProgRadioApi.RadioStream do
  use Ecto.Schema
  import Ecto.Changeset
  alias ProgRadioApi.Repo
  alias ProgRadioApi.{Radio, SubRadio, Stream, ListeningSession}

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
    belongs_to(:sub_radio, SubRadio)
    has_many(:stream, Stream)
    has_many(:listening_session, ListeningSession)
  end

  def update_streaming_changeset(radio_stream, params \\ %{}) do
    radio_stream
    |> cast(params, [:status, :retries])
    |> validate_required([:status, :retries])
  end

  @spec update_status(integer, boolean) :: any
  def update_status(id, increment) do
    query_end =
      case increment do
        false -> "0"
        true -> "current_song_retries + 1"
      end

    Repo.query(
      "UPDATE radio_stream SET current_song_retries = " <> query_end <> " WHERE id = $1;",
      [id]
    )
  end
end
