defmodule ProgRadioApiWeb.ListeningSessionController do
  import ProgRadioApiWeb.Utils.Controller, only: [send_error: 1]
  use ProgRadioApiWeb, :controller

  alias ProgRadioApi.ListeningSessions
  alias ProgRadioApi.ListenersCounter
  alias ProgRadioApi.Streams

  #  def index(conn, _params) do
  #    listening_session = ListeningSessions.list_listening_session()
  #    render(conn, "index.json", listening_session: listening_session)
  #  end

  def create(conn, listening_session_params) do
    with false <-
           (conn.remote_ip |> Tuple.to_list() |> Enum.join(".")) in Application.get_env(
             :progradio_api,
             :banned_ips
           ),
         {:ok, listening_session} <-
           ListeningSessions.create_listening_session(listening_session_params, conn.remote_ip) do
      spawn(fn ->
        ListenersCounter.register_listening_session(listening_session, false)

        if Map.has_key?(listening_session_params, "stream_id"),
           do: Streams.reset_streaming_error(listening_session_params["stream_id"])
      end)

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
    with false <-
           (conn.remote_ip |> Tuple.to_list() |> Enum.join(".")) in Application.get_env(
             :progradio_api,
             :banned_ips
           ),
         existing_listening_session when not is_nil(existing_listening_session) <-
           ListeningSessions.get_listening_session!(id, listening_session_params),
         {:ok, updated_listening_session} <-
           ListeningSessions.update_listening_session(
             existing_listening_session,
             listening_session_params,
             conn.remote_ip
           ) do
      spawn(fn ->
        if Map.get(listening_session_params, "ending") == true do
          ListenersCounter.remove_listening_session(updated_listening_session)
        else
          ListenersCounter.register_listening_session(updated_listening_session, true)
        end

        if Map.has_key?(listening_session_params, "stream_id"),
           do: Streams.reset_streaming_error(listening_session_params["stream_id"])
      end)

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
