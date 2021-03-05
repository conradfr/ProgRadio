defmodule ProgRadioApiWeb.ScheduleController do
  use ProgRadioApiWeb, :controller

  alias ProgRadioApi.Schedule

  action_fallback ProgRadioApiWeb.FallbackController

  def index(%{params: conn_params} = conn, %{"day" => day} = _params)
      when :erlang.is_map_key("c", conn_params) do
    schedule = Schedule.list_schedule_collection(day, conn_params["c"])
    render(conn, "index.json", schedule: schedule)
  end

  def index(%{params: conn_params} = conn, %{"day" => day} = _params)
      when :erlang.is_map_key("r", conn_params) do
    radios =
      conn_params["r"]
      |> String.split(",")

    schedule = Schedule.list_schedule_radios(day, radios)
    render(conn, "index.json", schedule: schedule)
  end

  def index(conn, %{"day" => day} = _params) do
    schedule = Schedule.list_schedule(day)
    render(conn, "index.json", schedule: schedule)
  end
end
