defmodule ProgRadioApiWeb.ScheduleJSON do
  def index(%{schedule: schedule}) do
    %{schedule: schedule}
  end

  def create(%{status: status}) do
    %{status: status}
  end
end
