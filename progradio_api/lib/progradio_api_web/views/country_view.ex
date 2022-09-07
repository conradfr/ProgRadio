defmodule ProgRadioApiWeb.CountryView do
  use ProgRadioApiWeb, :view

  def render("list.json", %{countries: countries}) do
    %{countries: countries}
  end
end
