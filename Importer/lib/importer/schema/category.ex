defmodule Importer.Category do
  use Ecto.Schema

  schema "category" do
    field :code_name, :string
    field :name, :string
  end
end
