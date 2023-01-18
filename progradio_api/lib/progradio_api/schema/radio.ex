defmodule ProgRadioApi.Radio do
  use Ecto.Schema
  alias ProgRadioApi.{SubRadio, RadioStream, ScheduleEntry, Category, Collection}

  schema "radio" do
    field(:code_name, :string)
    field(:name, :string)
    field(:active, :boolean)
    field(:share, :decimal)
    field(:country_code, :string)
    field(:has_preroll, :boolean)
    has_many(:schedule_entry, ScheduleEntry)
    has_many(:sub_radio, SubRadio)
    has_many(:radio_stream, RadioStream)
    belongs_to(:category, Category)
    belongs_to(:collection, Collection)
  end
end
