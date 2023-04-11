defmodule ProgRadioApiWeb.ConfigController do
  use ProgRadioApiWeb, :controller

  def index(conn, _params) do
    server =
      ProgRadioApi.Importer.StreamsImporter.RadioBrowser.get_one_random_server()
      |> Kernel.to_string()
      |> then(fn x -> "https://" <> x end)

    conn
    |> RequestCache.store()
    |> render("index.json", radio_browser_url: server)
  end
end
