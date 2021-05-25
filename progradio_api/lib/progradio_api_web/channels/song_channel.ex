defmodule ProgRadioApiWeb.SongChannel do
  import Ecto.Query, only: [from: 2]
  use Phoenix.Channel
  alias ProgRadioApiWeb.Presence
  alias ProgRadioApi.Repo
  alias ProgRadioApi.RadioStream
  alias ProgRadioApi.StreamSong
  alias ProgRadioApi.Stream
  alias ProgRadioApi.Radio

  def join("song:" <> radio_stream_codename, _params, socket) do
    # check radio first, if null, check stream
    radio_stream_data =
      case get_radio_stream(radio_stream_codename) do
        data when is_nil(data) -> get_stream_song(radio_stream_codename)
        data -> data
      end

    case radio_stream_data !== nil do
      true ->
        send(self(), {:after_join, "song:" <> radio_stream_codename, radio_stream_data})
        {:ok, socket}

      false ->
        {:error, "not available"}
    end
  end

  def join("url:" <> url, _params, socket) do
    case URI.parse(url) do
      url_parsed when url_parsed.host == nil ->
        {:error, "not available"}

      _ ->
        send(self(), {:after_join, "url:" <> url, nil})
        {:ok, socket}
    end
  end

  def handle_info({:after_join, song_topic, radio_stream_data}, socket) do
    {:ok, _} =
      Presence.track(self(), song_topic, :rand.uniform(), %{
        online_at: inspect(System.system_time(:second))
      })

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

  @spec get_stream_song(String.t()) :: any()
  defp get_stream_song(code_name) do
    query =
      from(s in Stream,
        join: ss in StreamSong,
        on: ss.id == s.stream_song_id,
        select: %{radio_code_name: ss.code_name, radio_stream_code_name: s.stream_song_code_name},
        where: s.stream_song_code_name == ^code_name and ss.enabled == true
      )

    Repo.one(query)
  end
end
