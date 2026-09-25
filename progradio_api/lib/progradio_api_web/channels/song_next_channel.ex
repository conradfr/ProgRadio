# This is the evolution of the SongChannel
# with progressive rollout
defmodule ProgRadioApiWeb.SongNextChannel do
  import Ecto.Query, only: [from: 2, dynamic: 2]
  use Phoenix.Channel
  use Nebulex.Caching

  alias ProgRadioApiWeb.Presence
  alias ProgRadioApi.Repo
  alias ProgRadioApi.Cache
  alias ProgRadioApi.{StreamSong, Stream}

  @cache_prefix_stream_song "channel_stream_song_"
  # 1h
  @cache_ttl_ms 3_600_000

  def join("song_next:" <> stream_id, _params, socket) do
    case get_stream_data(stream_id) do
      nil ->
        {:error, "not available"}

      data when not is_nil(data.stream_song_code_name) and not is_nil(data.stream_song_stream_code_name) ->
        send(self(), {:after_join, "song:#{data.stream_song_code_name}_#{data.stream_song_stream_code_name}", data})
        {:ok, socket}

      data ->
        send(self(), {:after_join, "url:" <> data.stream_url, data})
        {:ok, socket}
    end
  end

  def handle_info({:after_join, song_topic, stream_data}, socket) do
    {:ok, _} =
      Presence.track(self(), song_topic, :rand.uniform(), %{
        online_at: inspect(System.system_time(:second))
      })

    ProgRadioApi.SongManager.join(song_topic, stream_data, self())
    {:noreply, socket}
  end

  # sent by song server (if already exists) when user join channel
  def handle_info({:push_song, event, song_data}, socket) do
    push(socket, event, song_data)
    {:noreply, socket}
  end

  intercept ["presence_diff"]

  # we don't need to send presence_diff as it's only used by internal service
  def handle_out("presence_diff", _msg, socket) do
    {:noreply, socket}
  end

  # ----- Internal -----

  @spec get_stream_data(String.t()) :: any()
  @decorate cacheable(
              cache: Cache,
              key: "#{@cache_prefix_stream_song}#{stream_id}",
              opts: [ttl: @cache_ttl_ms]
            )
  defp get_stream_data(stream_id) when is_binary(stream_id) do
    query =
      from(s in Stream,
        left_join: ss in StreamSong,
        on: ss.id == s.stream_song_id and ss.enabled == true,
        select: %{
          stream_id: s.id,
          stream_url: s.stream_url,
          stream_song_code_name: ss.code_name,
          stream_song_stream_code_name: s.stream_song_code_name,

          # compat layer
          # TODO remove once transition done
          radio_code_name: ss.code_name,
        },
        where: s.banned != true and s.id == ^stream_id,
        limit: 1
      )

    Repo.one(query)
  end
end
