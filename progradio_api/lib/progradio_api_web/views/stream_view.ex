defmodule ProgRadioApiWeb.StreamView do
  use ProgRadioApiWeb, :view

  def render("index.json", %{streams: streams, total: total, timestamp: timestamp}) do
    %{streams: streams, total: total, timestamp: timestamp}
  end
end
