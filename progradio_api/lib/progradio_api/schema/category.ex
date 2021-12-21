defmodule ProgRadioApi.Category do
  use Ecto.Schema

  schema "category" do
    field(:code_name, :string)
    field(:name, :string)
    field(:name_fr, :string)
    field(:name_en, :string)
    field(:name_es, :string)
  end
end
