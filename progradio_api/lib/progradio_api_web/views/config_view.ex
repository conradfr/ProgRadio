defmodule ProgRadioApiWeb.ConfigView do
  use ProgRadioApiWeb, :view

  def render("index.json", %{radio_browser_url: radio_browser_url}) do
    %{radio_browser_url: radio_browser_url}
  end
end
