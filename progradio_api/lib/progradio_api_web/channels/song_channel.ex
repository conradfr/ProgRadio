defmodule ProgRadioApiWeb.SongChannel do
  import Ecto.Query, only: [from: 2]
  use Phoenix.Channel
  alias ProgRadioApiWeb.Presence
  alias ProgRadioApi.Repo
  alias ProgRadioApi.RadioStream
  alias ProgRadioApi.Radio

  def join("song:" <> radio_stream_codename, _params, socket) do
    radio_stream_data = get_radio_stream(radio_stream_codename)

    case radio_stream_data !== nil do
      true ->
        send(self(), {:after_join, "song:" <> radio_stream_codename, radio_stream_data})
        {:ok, socket}

      false ->
        {:error, "not available"}
    end
  end

  def handle_info({:after_join, song_topic, radio_stream_data}, socket) do
    {:ok, _} =
      Presence.track(self(), song_topic, :rand.uniform(), %{
        online_at: inspect(System.system_time(:second))
      })

    # push(socket, "presence_state", Presence.list(song_topic))
    ProgRadioApi.SongManager.join(song_topic, radio_stream_data)
    {:noreply, socket}
  end

  @spec get_radio_stream(String.t()) :: any()
  defp get_radio_stream(code_name) do
    query =
      from(rs in RadioStream,
        join: r in Radio,
        on: r.id == rs.radio_id,
        select: %{radio_code_name: r.code_name, radio_stream_code_name: rs.code_name},
        where: rs.code_name == ^code_name
      )

    Repo.one(query)
  end
end
