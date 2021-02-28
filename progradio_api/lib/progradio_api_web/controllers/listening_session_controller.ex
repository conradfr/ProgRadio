defmodule ProgRadioApiWeb.ListeningSessionController do
  use ProgRadioApiWeb, :controller

  alias ProgRadioApi.ListeningSessions
  alias ProgRadioApi.ListeningSession

  action_fallback ProgRadioApiWeb.FallbackController

#  def index(conn, _params) do
#    listening_session = ListeningSessions.list_listening_session()
#    render(conn, "index.json", listening_session: listening_session)
#  end

  def create(conn, listening_session_params) do
    with {:ok, %ListeningSession{}} <-
           ListeningSessions.create_listening_session(listening_session_params, conn.remote_ip) do
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

#  def show(conn, %{"id" => id}) do
#    listening_session = ListeningSessions.get_listening_session!(id)
#    render(conn, "show.json", listening_session: listening_session)
#  end
#
#  def update(conn, %{"id" => id, "listening_session" => listening_session_params}) do
#    listening_session = ListeningSessions.get_listening_session!(id)
#
#    with {:ok, %ListeningSession{} = listening_session} <-
#           ListeningSessions.update_listening_session(listening_session, listening_session_params) do
#      render(conn, "show.json", listening_session: listening_session)
#    end
#  end
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
