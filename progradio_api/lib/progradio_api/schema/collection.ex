defmodule ProgRadioApi.Collection do
  use Ecto.Schema

  schema "collection" do
    field(:code_name, :string)
    field(:name, :string)
    field(:name_fr, :string)
    field(:name_en, :string)
    field(:name_es, :string)
    field(:name_de, :string)
    field(:name_pt, :string)
    field(:name_it, :string)
    field(:name_pl, :string)
    field(:name_el, :string)
    field(:name_ar, :string)
    field(:priority, :integer)
    field(:sort_field, :string)
    field(:sort_order, :string)
    field(:short_name, :string)
  end
end
