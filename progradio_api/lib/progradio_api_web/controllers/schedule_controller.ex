defmodule ProgRadioApiWeb.ScheduleController do
  import Canada, only: [can?: 2]
  use ProgRadioApiWeb, :controller

  alias ProgRadioApi.Repo
  alias ProgRadioApi.Radio
  alias ProgRadioApi.Schedule

  action_fallback ProgRadioApiWeb.FallbackController

  # ---------- GET ----------

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

  # ---------- POST ----------

  def create(conn, %{"radio" => radio_code_name} = schedule_params) do
    with api_user when api_user != nil <- Map.get(conn.private, :api_user),
         radio when radio != nil <- Repo.get_by(Radio, code_name: radio_code_name),
         api_status when api_status == true <- conn.private[:api_user] |> can?(add(radio)) do
      ProgRadioApi.Schedules.add_schedule_to_queue(radio, schedule_params)

      conn
      |> put_status(:created)
      |> json(%{"status" => "OK"})
    else
      _ ->
        conn
        |> put_status(:bad_request)
        |> json(%{"status" => "Error"})
    end
  end
end
