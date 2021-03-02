defmodule ProgRadioApiWeb.RadioController do
  use ProgRadioApiWeb, :controller

  alias ProgRadioApi.Radios

  action_fallback ProgRadioApiWeb.FallbackController

  def index(conn, _params) do
    radios = Radios.list_active_radios()
    collections = Radios.list_collections()
    categories = Radios.list_categories()
    render(conn, "index.json", radios: radios, collections: collections, categories: categories)
  end
end
