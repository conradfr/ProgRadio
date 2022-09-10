defmodule ProgRadioApiWeb.CountryView do
  use ProgRadioApiWeb, :view

  def render("list.json", %{countries: countries}) do
    %{countries: %Jason.OrderedObject{values: countries}}
  end
end
