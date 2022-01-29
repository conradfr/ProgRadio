defmodule ProgRadioApiWeb.ApiParams.Streams do
  import Ecto.Changeset
  use Ecto.Schema

  embedded_schema do
    field(:radio, :string)
    field(:text, :string)
    field(:country, :string)
    field(:sort, :string)
    field(:offset, :integer)
  end

  def changeset(streams, params \\ %{}) do
    streams
    |> cast(params, [
      :radio,
      :text,
      :country,
      :sort,
      :offset
    ])
  end
end
