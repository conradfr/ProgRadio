defmodule ProgRadioApiWeb.ListenersChannel do
  use Phoenix.Channel

  alias ProgRadioApi.ListenersCounter

  def join("listeners:" <> stream_code_name, _params, socket) do
    send(self(), {:after_join, stream_code_name})

    {:ok, socket}
  end

  def handle_info({:after_join, stream_code_name}, socket) do
    ListenersCounter.send_counter_of_stream(stream_code_name)

    {:noreply, socket}
  end
end
