defmodule ProgRadioApiWeb.SongChannel do
  use Phoenix.Channel
  alias ProgRadioApiWeb.Presence
  alias ProgRadioApi.Repo
  alias ProgRadioApi.RadioStream

  def join("song:" <> radio_stream_codename, _params, socket) do
    case radio_stream_has_current_song(radio_stream_codename) do
      true ->
        send(self(), {:after_join, "song:" <> radio_stream_codename})
        {:ok, socket}

      false ->
        {:error, "not available"}
    end
  end

  def handle_info({:after_join, song_topic}, socket) do
    {:ok, _} =
      Presence.track(self(), song_topic, :rand.uniform(), %{
        online_at: inspect(System.system_time(:second))
      })

    # push(socket, "presence_state", Presence.list(song_topic))
    ProgRadioApi.SongManager.join(song_topic)
    {:noreply, socket}
  end

  @spec radio_stream_has_current_song(String.t()) :: boolean()
  defp radio_stream_has_current_song(code_name) do
    Repo.get_by(RadioStream, code_name: code_name, enabled: true, current_song: true) !== nil
  end
end
