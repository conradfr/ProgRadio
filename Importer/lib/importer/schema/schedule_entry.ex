defmodule Importer.ScheduleEntry do
  use Ecto.Schema

  schema "schedule_entry" do
    field :date_time_start, :utc_datetime
    field :date_time_end, :utc_datetime
    field :title, :string
    field :host, :string
    field :description, :string
    field :picture_url, :string
    belongs_to :radio, Importer.Radio
  end
end
