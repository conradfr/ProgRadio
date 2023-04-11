defmodule ProgRadioApiWeb.Utils.Controller do
  use ProgRadioApiWeb, :controller

  def send_error(conn, status \\ 400, message \\ "Error") do
    conn
    |> put_status(status)
    |> put_view(json: ProgRadioApiWeb.ErrorJSON)
    |> render("400.json", message: message)
  end
end
