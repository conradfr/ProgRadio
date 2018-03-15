defmodule Importer.Radio do
  use Ecto.Schema

  schema "radio" do
    field(:code_name, :string)
    has_many(:schedule_entry, Importer.ScheduleEntry)
  end
end
