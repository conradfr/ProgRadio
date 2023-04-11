defmodule ProgRadioApiWeb.StreamJSON do
  def index(%{streams: streams, total: total, timestamp: timestamp}) do
    %{streams: streams, total: total, timestamp: timestamp}
  end

  def index(%{streams: streams}) do
    %{streams: streams}
  end
end
