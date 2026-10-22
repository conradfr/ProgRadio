defmodule ProgRadioApiWeb.StreamJSON do
  def index(%{streams: streams, total: total, timestamp: timestamp}) do
    %{streams: streams, total: total, timestamp: timestamp}
  end

  def index(%{streams: streams}) do
    %{streams: streams}
  end

  def stream_url(%{stream_url: stream_url}) do
    %{stream_url: stream_url}
  end

  def playing_error(_params) do
    %{status: :ok}
  end

  def search(_params) do
    %{status: :ok}
  end
end
