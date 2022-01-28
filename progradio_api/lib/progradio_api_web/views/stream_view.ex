defmodule ProgRadioApiWeb.StreamView do
  use ProgRadioApiWeb, :view

  def render("index.json", %{streams: streams, total: total}) do
    %{streams: streams, total: total}
  end
end
