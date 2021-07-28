defmodule ProgRadioApi.Radio do
  use Ecto.Schema
  alias ProgRadioApi.RadioStream
  alias ProgRadioApi.ScheduleEntry
  alias ProgRadioApi.Category
  alias ProgRadioApi.Collection
  alias ProgRadioApi.ApiUserRadio

  schema "radio" do
    field(:code_name, :string)
    field(:name, :string)
    field(:active, :boolean)
    field(:share, :decimal)
    field(:country_code, :string)
    has_many(:schedule_entry, ScheduleEntry)
    has_many(:radio_stream, RadioStream)
    belongs_to(:category, Category)
    belongs_to(:collection, Collection)
  end
end
