defmodule Importer.Stream do
  use Ecto.Schema
  import Ecto.Changeset

  #  @primary_key false
  @primary_key {:id, :binary_id, autogenerate: false}

  schema "stream" do
    #    field(:id, :binary_id, primary_key: true, autogenerate: false)
    field(:name, :string)
    field(:img, :string)
    field(:stream_url, :string)
    field(:country_code, :string)
    field(:language, :string)
    field(:votes, :integer, default: 0)
    field(:clicks_last_24h, :integer, default: 0)
  end

  def changeset(stream, params \\ %{}) do
    stream
    |> cast(params, [
      :id,
      :name,
      :img,
      :stream_url,
      :country_code,
      :language,
      :votes,
      :clicks_last_24h
    ])
    |> validate_required([:id, :name, :stream_url])
  end
end
