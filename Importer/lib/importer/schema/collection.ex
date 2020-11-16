defmodule Importer.Collection do
  use Ecto.Schema

  schema "collection" do
    field(:code_name, :string)
  end
end
