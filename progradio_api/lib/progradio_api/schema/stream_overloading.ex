defmodule ProgRadioApi.StreamOverloading do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: false}

  schema "stream_overloading" do
    field(:name, :string)
    field(:img, :string)
    field(:stream_url, :string)
    field(:tags, :string)
    field(:country_code, :string)
    field(:website, :string)
    field(:enabled, :boolean)
    field(:force_hls, :boolean)
    field(:force_mpd, :boolean)
    field(:created_at, :utc_datetime)
    field(:updated_at, :utc_datetime)
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
      :website,
    ])
    |> validate_required([:id])
  end
end
