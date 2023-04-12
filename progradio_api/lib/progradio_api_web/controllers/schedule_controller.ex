defmodule ProgRadioApiWeb.ScheduleController do
  import ProgRadioApiWeb.Utils.Controller, only: [send_error: 1]
  import Canada, only: [can?: 2]
  use ProgRadioApiWeb, :controller

  alias ProgRadioApi.Repo
  alias ProgRadioApi.{Radio, SubRadio, Schedule}

  # ---------- GET ----------

  def index(conn, %{"day" => day, "c" => collection} = params) do
    now = Map.get(params, "now", false) == "1"
    schedule = Schedule.list_schedule_collection(day, collection, now)

    conn
    |> RequestCache.store()
    |> render("index.json", schedule: schedule)
  end

  def index(conn, %{"day" => day, "r" => radio_list} = params) do
    now = Map.get(params, "now", false) == "1"
    radios = String.split(radio_list, ",")
    schedule = Schedule.list_schedule_radios(day, radios, now)

    conn
    |> RequestCache.store()
    |> render("index.json", schedule: schedule)
  end

  def index(conn, %{"day" => day} = params) do
    now = Map.get(params, "now", false) == "1"
    schedule = Schedule.list_schedule(day, now)

    conn
    |> RequestCache.store()
    |> render("index.json", schedule: schedule)
  end

  # ---------- POST ----------

  def create(
        conn,
        %{"radio" => radio_code_name, "sub_radio" => sub_radio_code_name} = schedule_params
      ) do
    with api_user when api_user != nil <- Map.get(conn.private, :api_user),
         %Radio{} = radio <- Repo.get_by(Radio, code_name: radio_code_name),
         %SubRadio{} = sub_radio <- Repo.get_by(SubRadio, code_name: sub_radio_code_name),
         true <- conn.private[:api_key] |> can?(add(radio)) do
      ProgRadioApi.Schedules.add_schedule_to_queue(radio, sub_radio, schedule_params)

      conn
      |> put_status(:created)
      |> render("create.json", status: "OK")
    else
      _ -> send_error(conn)
    end
  end
end
