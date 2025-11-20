defmodule ProgRadioApi.Stream do
  use Ecto.Schema
  import Ecto.Changeset
  alias ProgRadioApi.ListeningSession
  alias ProgRadioApi.RadioStream
  alias ProgRadioApi.StreamSong
  alias ProgRadioApi.StreamOverloading

  @primary_key {:id, :binary_id, autogenerate: false}

  schema "stream" do
    field(:name, :string)
    field(:img, :string)
    field(:original_img, :string)
    field(:stream_url, :string)
    field(:original_stream_url, :string)
    field(:tags, :string)
    field(:original_tags, :string)
    field(:website, :string)
    field(:country_code, :string)
    field(:language, :string)
    field(:votes, :integer, default: 0)
    field(:clicks_last_24h, :integer, default: 0)
    field(:score, :integer, default: 0)
    field(:stream_song_code_name, :string)
    field(:source, :string, default: "radio-browser")
    field(:enabled, :boolean)
    field(:banned, :boolean)
    field(:popup, :boolean)
    field(:checked, :boolean)
    field(:slogan, :string)
    field(:description, :string)
    field(:redirect_to, :binary_id)
    field(:playing_error, :integer, default: 0)
    field(:playing_error_reason, :string, default: nil)
    field(:force_hls, :boolean)
    field(:force_mpd, :boolean)
    #    field(:editing_key, :string)
    field(:import_updated_at, :utc_datetime, default: nil)
    field(:last_listening_at, :utc_datetime, default: nil)
    field(:created_at, :utc_datetime)
    field(:updated_at, :utc_datetime)

    belongs_to(:radio_stream, RadioStream)
    belongs_to(:stream_song, StreamSong)
    has_many(:listening_session, ListeningSession)
    has_one(:stream_overloading, StreamOverloading, foreign_key: :id)
  end

  def changeset(stream, params \\ %{}) do
    stream
    |> cast(params, [
      :id,
      :name,
      :img,
      :original_img,
      :website,
      :stream_url,
      :original_stream_url,
      :tags,
      :original_tags,
      :country_code,
      :language,
      :slogan,
      :description,
      :votes,
      :clicks_last_24h,
      :score,
      :enabled,
      :redirect_to,
      :import_updated_at
    ])
    |> validate_required([:id, :name, :stream_url])
  end

  def changeset_radio_stream_match(stream, params \\ %{}) do
    stream
    |> change(params)
  end

  def changeset_img(stream, params \\ %{}) do
    stream
    |> cast(params, [
      :img
    ])
  end

  def changeset_enabled(stream, params \\ %{}) do
    stream
    |> cast(params, [
      :enabled
    ])
    |> validate_required([:id, :enabled])
  end

  def changeset_last_listening_at(stream, params \\ %{}) do
    stream
    |> cast(params, [
      :last_listening_at
    ])
    |> validate_required([:id, :last_listening_at])
  end

  def changeset_checked(stream, params \\ %{}) do
    stream
    |> cast(params, [
      :checked
    ])
    |> validate_required([:id, :checked])
  end

  def changeset_playing_error(stream, params \\ %{}) do
    stream
    |> cast(params, [
      :playing_error,
      :playing_error_reason
    ])
    |> validate_required([:id, :playing_error])
  end

  def changeset_description(stream, params \\ %{}) do
    stream
    |> cast(params, [
      :description
    ])
    |> validate_required([:description])
  end
end
