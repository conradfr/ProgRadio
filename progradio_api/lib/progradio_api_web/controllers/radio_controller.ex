defmodule ProgRadioApiWeb.RadioController do
  use ProgRadioApiWeb, :controller
  import Canada, only: [can?: 2]

  alias ProgRadioApi.Radios

  action_fallback ProgRadioApiWeb.FallbackController

  def index(conn, _params) do
    radios = Radios.list_active_radios()
    collections = Radios.list_collections()
    categories = Radios.list_categories()

    conn
    |> RequestCache.store()
    |> render("index.json", radios: radios, collections: collections, categories: categories)
  end

  def list(conn, _params) do
    with api_key when api_key != nil <- Map.get(conn.private, :api_key),
         true <- can?(api_key, list(:radio)) do
      radios = Radios.list_radios_per_api_key(api_key.id)
      render(conn, "list.json", radios: radios)
    else
      _ ->
        conn
        |> put_status(:bad_request)
        |> json(%{"status" => "Error"})
    end
  end
end
