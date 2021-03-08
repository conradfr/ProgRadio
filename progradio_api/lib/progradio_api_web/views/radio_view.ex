defmodule ProgRadioApiWeb.RadioView do
  use ProgRadioApiWeb, :view

  def render("index.json", %{radios: radios, collections: collections, categories: categories}) do
    %{radios: radios, collections: collections, categories: categories}
  end

  #  def render("show.json", %{radio: radio}) do
  #    %{data: render_one(radio, RadioView, "radio.json")}
  #  end

  #  def render("radio.json", %{radio: radio}) do
  #    %{id: radio.id}
  #  end
end
