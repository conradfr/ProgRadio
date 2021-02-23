defmodule ProgRadioApi.Radio do
  use Ecto.Schema

  schema "radio" do
    field(:code_name, :string)
    field(:active, :boolean)
  end
end
