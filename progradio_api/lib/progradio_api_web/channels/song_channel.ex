defmodule ProgRadioApiWeb.SongChannel do
  import Ecto.Query, only: [from: 2]
  use Phoenix.Channel
  alias ProgRadioApiWeb.Presence
  alias ProgRadioApi.Repo
  alias ProgRadioApi.RadioStream
  alias ProgRadioApi.StreamSong
  alias ProgRadioApi.Stream
  alias ProgRadioApi.Radio
  alias ProgRadioApi.Collection

  def join("songs", _params, socket) do
    {:ok, socket}
  end

  def join("song:" <> radio_stream_code_name, _params, socket) do
    # check radio first, if null, check stream
    radio_stream_data =
      case get_radio_stream(radio_stream_code_name) do
        data when is_nil(data) -> get_stream_song(radio_stream_code_name)
        data -> data
      end

    case radio_stream_data !== nil do
      true ->
        send(self(), {:after_join, "song:" <> radio_stream_code_name, radio_stream_data})
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

  def join("collection:" <> collection_code_name, _params, socket) do
    # check collection radios first
    case get_collection_streams(collection_code_name) do
      nil ->
        {:error, "not available"}

      data ->
        send(self(), {:after_join_collection, "collection:" <> collection_code_name, data})
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

  def handle_info({:after_join_collection, collection_topic, radios_stream_data}, socket) do
    {:ok, _} =
      Presence.track(self(), collection_topic, :rand.uniform(), %{
        online_at: inspect(System.system_time(:second))
      })

    radios_stream_data
    |> Enum.each(fn data ->
      ProgRadioApi.SongManager.join("song:" <> data.radio_stream_code_name, data)
    end)

    {:noreply, socket}
  end

  # ----- Internal -----

  @spec get_radio_stream(String.t()) :: any()
  defp get_radio_stream(code_name) do
    query =
      from(rs in RadioStream,
        join: r in Radio,
        on: r.id == rs.radio_id,
        join: c in Collection,
        on: c.id == r.collection_id,
        select: %{
          radio_code_name: r.code_name,
          radio_stream_code_name: rs.code_name,
          id: rs.id,
          type: "radio_stream",
          collection_code_name: c.code_name
        },
        where: rs.code_name == ^code_name,
        limit: 1
      )

    Repo.one(query)
  end

  @spec get_stream_song(String.t()) :: any()
  defp get_stream_song(code_name) do
    query =
      from(s in Stream,
        join: ss in StreamSong,
        on: ss.id == s.stream_song_id,
        select: %{
          radio_code_name: ss.code_name,
          radio_stream_code_name: s.stream_song_code_name,
          id: ss.id,
          type: "stream_song"
        },
        where: s.stream_song_code_name == ^code_name and ss.enabled == true,
        order_by: [desc: s.clicks_last_24h],
        limit: 1
      )

    Repo.one(query)
  end

  @spec get_collection_streams(String.t()) :: any()
  defp get_collection_streams(collection_code_name) do
    query =
      from(rs in RadioStream,
        join: r in Radio,
        on: r.id == rs.radio_id,
        join: c in Collection,
        on: c.id == r.collection_id,
        select: %{
          radio_code_name: r.code_name,
          radio_stream_code_name: rs.code_name,
          id: rs.id,
          type: "radio_stream",
          collection_code_name: c.code_name
        },
        where:
          r.active == true and rs.main == true and rs.enabled == true and
            rs.current_song == true and c.code_name == ^collection_code_name
      )

    Repo.all(query)
  end
end
