defmodule Importer.Radio do
  use Ecto.Schema

  schema "radio" do
    field(:code_name, :string)
    field(:active, :boolean)
    has_many(:schedule_entry, Importer.ScheduleEntry)
    belongs_to(:collection, Importer.Collection)
  end
end
