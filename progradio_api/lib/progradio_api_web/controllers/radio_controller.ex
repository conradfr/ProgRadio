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

  #  def create(conn, %{"radio" => radio_params}) do
  #    with {:ok, %Radio{} = radio} <- Radios.create_radio(radio_params) do
  #      conn
  #      |> put_status(:created)
  #      |> put_resp_header("location", Routes.radios_radio_path(conn, :show, radio))
  #      |> render("show.json", radio: radio)
  #    end
  #  end
  #
  #  def show(conn, %{"id" => id}) do
  #    radio = Radios.get_radio!(id)
  #    render(conn, "show.json", radio: radio)
  #  end
  #
  #  def update(conn, %{"id" => id, "radio" => radio_params}) do
  #    radio = Radios.get_radio!(id)
  #
  #    with {:ok, %Radio{} = radio} <- Radios.update_radio(radio, radio_params) do
  #      render(conn, "show.json", radio: radio)
  #    end
  #  end
  #
  #  def delete(conn, %{"id" => id}) do
  #    radio = Radios.get_radio!(id)
  #
  #    with {:ok, %Radio{}} <- Radios.delete_radio(radio) do
  #      send_resp(conn, :no_content, "")
  #    end
  #  end
end
