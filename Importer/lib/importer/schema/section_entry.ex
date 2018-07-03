defmodule Importer.SectionEntry do
  use Ecto.Schema

  schema "section_entry" do
    field(:date_time_start, :utc_datetime)
    field(:title, :string)
    field(:presenter, :string)
    field(:description, :string)
    field(:picture_url, :string)
    belongs_to(:schedule_entry, Importer.ScheduleEntry)
  end
end
