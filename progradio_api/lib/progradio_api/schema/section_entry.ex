defmodule ProgRadioApi.SectionEntry do
  use Ecto.Schema
  import Ecto.Changeset
  alias ProgRadioApi.ScheduleEntry

  schema "section_entry" do
    field(:date_time_start, :utc_datetime)
    field(:title, :string)
    field(:presenter, :string)
    field(:description, :string)
    field(:picture_url, :string)
    belongs_to(:schedule_entry, ScheduleEntry)
  end

  def changeset(schedule, params \\ %{}) do
    if Map.has_key?(params, "id") == true do
      update_changeset(schedule, params)
    else
      create_changeset(schedule, params)
    end
  end

  def create_changeset(schedule, params) do
    schedule
    |> cast(params, [:date_time_start, :title, :presenter, :description, :picture_url])
    |> Ecto.Changeset.validate_required([:date_time_start, :title])
  end

  defp update_changeset(schedule, params) do
    schedule
    |> cast(params, [:title, :presenter, :description, :picture_url])
    |> Ecto.Changeset.validate_required([:title])
  end
end
