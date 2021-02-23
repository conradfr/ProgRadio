defmodule ProgRadioApi.RadioStream do
  use Ecto.Schema

  schema "radio_stream" do
    field(:code_name, :string)
    field(:enabled, :boolean)
    field(:current_song, :boolean)
    belongs_to(:radio, ProgRadioApi.Radio)
  end
end
