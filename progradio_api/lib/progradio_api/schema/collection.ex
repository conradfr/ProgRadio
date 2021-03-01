defmodule ProgRadioApi.Collection do
  use Ecto.Schema

  schema "collection" do
    field(:code_name, :string)
    field(:name, :string)
    field(:priority, :integer)
    field(:sort_field, :string)
    field(:sort_order, :string)
    field(:short_name, :string)
  end
end
