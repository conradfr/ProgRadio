defmodule ProgRadioApiWeb.ConfigJSON do
  def index(%{radio_browser_url: radio_browser_url}) do
    %{radio_browser_url: radio_browser_url}
  end
end
