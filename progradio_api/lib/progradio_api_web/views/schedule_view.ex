defmodule ProgRadioApiWeb.ScheduleView do
  use ProgRadioApiWeb, :view

  def render("index.json", %{schedule: schedule}) do
    %{schedule: schedule}
  end

  #  def render("show.json", %{schedule: schedule}) do
  #    %{data: render_one(schedule, ScheduleView, "schedule.json")}
  #  end
  #
  #  def render("schedule.json", %{schedule: schedule}) do
  #    %{id: schedule.id}
  #  end
end
