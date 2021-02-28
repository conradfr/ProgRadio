defmodule ProgRadioApi.Stream do
  use Ecto.Schema
  import Ecto.Changeset
  alias ProgRadioApi.ListeningSession

  @primary_key {:id, :binary_id, autogenerate: false}

  schema "stream" do
    field(:name, :string)
    field(:img, :string)
    field(:stream_url, :string)
    field(:tags, :string)
    field(:country_code, :string)
    field(:language, :string)
    field(:votes, :integer, default: 0)
    field(:clicks_last_24h, :integer, default: 0)
    has_many(:listening_session, ListeningSession)
  end

  def changeset(stream, params \\ %{}) do
    stream
    |> cast(params, [
      :id,
      :name,
      :img,
      :stream_url,
      :tags,
      :country_code,
      :language,
      :votes,
      :clicks_last_24h
    ])
    |> validate_required([:id, :name, :stream_url])
  end
end
