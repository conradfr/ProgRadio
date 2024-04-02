defmodule ProgRadioApi.StreamCheck do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: false}

  schema "stream_check" do
    field(:img, :boolean)
    field(:stream_url, :boolean, default: nil)
    field(:website, :boolean, default: nil)
    field(:website_ssl, :boolean, default: nil)
    field(:checked_at, :utc_datetime)
  end

  def changeset(stream, params \\ %{}) do
    stream
    |> cast(params, [
      :img,
      :stream_url,
      :website,
      :website_ssl,
      :checked_at
    ])
    |> validate_required([:checked_at])
  end
end
