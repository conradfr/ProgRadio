defmodule ProgRadioApi.StreamOverloading do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: false}

  schema "stream_overloading" do
    field(:name, :string)
    field(:img, :string)
    field(:stream_url, :string)
  end

  def changeset(stream, params \\ %{}) do
    stream
    |> cast(params, [
      :id,
      :name,
      :img,
      :stream_url,
    ])
    |> validate_required([:id])
  end
end
