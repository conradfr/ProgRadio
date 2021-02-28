defmodule ProgRadioApi.Radio do
  use Ecto.Schema
  alias ProgRadioApi.RadioStream

  schema "radio" do
    field(:code_name, :string)
    field(:active, :boolean)
    has_many(:radio_stream, RadioStream)
  end
end
