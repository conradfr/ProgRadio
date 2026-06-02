defmodule ProgRadioApiWeb.Plug.HealthCheck do
  import Plug.Conn

  # init/1 is required by the Plug behaviour but can be left as-is.
  def init(opts), do: opts

  # If the request path matches "/health", we return a 200 response.
  def call(conn = %Plug.Conn{request_path: "/health"}, _opts) do
    conn
    |> send_resp(200, "")
    |> halt()  # Halts further processing of the request.
  end

  # If the request path is anything else, we pass the connection along.
  def call(conn, _opts), do: conn
end
