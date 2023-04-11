defmodule ProgRadioApiWeb.ListeningSessionController do
  import ProgRadioApiWeb.Utils.Controller, only: [send_error: 1]
  use ProgRadioApiWeb, :controller

  alias ProgRadioApi.ListeningSessions

  #  def index(conn, _params) do
  #    listening_session = ListeningSessions.list_listening_session()
  #    render(conn, "index.json", listening_session: listening_session)
  #  end

  def create(conn, listening_session_params) do
    with {:ok, listening_session} <-
           ListeningSessions.create_listening_session(listening_session_params, conn.remote_ip) do
      conn
      |> put_status(:created)
      |> render("one.json", %{
        status: "OK",
        id: listening_session.id,
        date_time_start: listening_session.date_time_start,
        date_time_end: listening_session.date_time_end
      })
    else
      _ -> send_error(conn)
    end
  end

  def update(conn, %{"id" => id} = listening_session_params) do
    with existing_listening_session when not is_nil(existing_listening_session) <-
           ListeningSessions.get_listening_session!(id, listening_session_params),
         {:ok, updated_listening_session} <-
           ListeningSessions.update_listening_session(
             existing_listening_session,
             listening_session_params,
             conn.remote_ip
           ) do
      conn
      |> put_status(:ok)
      |> render("one.json", %{
        status: "OK",
        id: updated_listening_session.id,
        date_time_start: updated_listening_session.date_time_start,
        date_time_end: updated_listening_session.date_time_end
      })
    else
      _ -> send_error(conn)
    end
  end
end
