defmodule ProgRadioApiWeb.ListenersChannel do
  use Phoenix.Channel

  alias ProgRadioApi.ListenersCounter

  def join("listeners:" <> stream_id_or_radio_code_name, _params, socket) do
    send(self(), {:after_join, stream_id_or_radio_code_name})
    {:ok, socket}
  end

  def handle_info({:after_join, stream_id_or_radio_code_name}, socket) do
    current_count = ListenersCounter.get_count_of_stream(stream_id_or_radio_code_name)

    push(socket, "counter_update", %{name: stream_id_or_radio_code_name, listeners: current_count})

    {:noreply, socket}
  end
end
