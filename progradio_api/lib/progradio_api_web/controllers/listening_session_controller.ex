defmodule ProgRadioApiWeb.ListeningSessionController do
  use ProgRadioApiWeb, :controller

  alias ProgRadioApi.ListeningSessions

  action_fallback ProgRadioApiWeb.FallbackController

  #  def index(conn, _params) do
  #    listening_session = ListeningSessions.list_listening_session()
  #    render(conn, "index.json", listening_session: listening_session)
  #  end

  def create(conn, listening_session_params) do
    with {:ok, listening_session} <-
           ListeningSessions.create_listening_session(listening_session_params, conn.remote_ip) do
      conn
      |> put_status(:created)
      |> json(%{
        "status" => "OK",
        "id" => listening_session.id,
        "date_time_start" => listening_session.date_time_start,
        "date_time_end" => listening_session.date_time_end
      })
    else
      _ ->
        conn
        |> put_status(:bad_request)
        |> json(%{"status" => "Error"})
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
      |> json(%{
        "status" => "OK",
        "id" => updated_listening_session.id,
        "date_time_start" => updated_listening_session.date_time_start,
        "date_time_end" => updated_listening_session.date_time_end
      })
    else
      _ ->
        conn
        |> put_status(:bad_request)
        |> json(%{"status" => "Error"})
    end
  end

  #  def show(conn, %{"id" => id}) do
  #    listening_session = ListeningSessions.get_listening_session!(id)
  #    render(conn, "show.json", listening_session: listening_session)
  #  end
  #
  #
  #  def delete(conn, %{"id" => id}) do
  #    listening_session = ListeningSessions.get_listening_session!(id)
  #
  #    with {:ok, %ListeningSession{}} <-
  #           ListeningSessions.delete_listening_session(listening_session) do
  #      send_resp(conn, :no_content, "")
  #    end
  #  end
end
