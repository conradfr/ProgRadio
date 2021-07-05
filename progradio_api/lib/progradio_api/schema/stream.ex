defmodule ProgRadioApi.Stream do
  use Ecto.Schema
  import Ecto.Changeset
  alias ProgRadioApi.ListeningSession
  alias ProgRadioApi.RadioStream
  alias ProgRadioApi.StreamSong

  @primary_key {:id, :binary_id, autogenerate: false}

  schema "stream" do
    field(:name, :string)
    field(:img, :string)
    field(:stream_url, :string)
    field(:tags, :string)
    field(:website, :string)
    field(:country_code, :string)
    field(:language, :string)
    field(:votes, :integer, default: 0)
    field(:clicks_last_24h, :integer, default: 0)
    field(:stream_song_code_name, :string)
    belongs_to(:radio_stream, RadioStream)
    belongs_to(:stream_song, StreamSong)
    has_many(:listening_session, ListeningSession)
  end

  def changeset(stream, params \\ %{}) do
    stream
    |> cast(params, [
      :id,
      :name,
      :img,
      :website,
      :stream_url,
      :tags,
      :country_code,
      :language,
      :votes,
      :clicks_last_24h
    ])
    |> validate_required([:id, :name, :stream_url])
  end

  def changeset_radio_stream_match(stream, params \\ %{}) do
    stream
    |> change(params)
  end
end
