defmodule Importer.ScheduleEntry do
  use Ecto.Schema
  import Ecto.Changeset
  alias Importer.Repo

  schema "schedule_entry" do
    field(:date_time_start, :utc_datetime)
    field(:date_time_end, :utc_datetime)
    field(:title, :string)
    field(:host, :string)
    field(:description, :string)
    field(:picture_url, :string)
    has_many(:sections, Importer.SectionEntry, on_replace: :delete)
    belongs_to(:radio, Importer.Radio)
  end

  def create_changeset(schedule, params \\ %{}) do
    schedule
    |> cast(params, [:date_time_start, :date_time_end, :title, :host, :description, :picture_url])
    |> cast_assoc(:sections, with: &Importer.SectionEntry.create_changeset/2)
    |> validate_required([:date_time_start, :date_time_end, :title])
  end

  def update_changeset(schedule, params \\ %{}) do
    schedule
    |> Repo.preload(:sections)
    |> cast(params, [:date_time_end, :title, :host, :description, :picture_url])
    |> cast_assoc(:sections)
    |> validate_required([:date_time_end, :title])
  end
end
