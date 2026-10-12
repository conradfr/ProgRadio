defmodule ProgRadioApi.ListeningSessions do
  @moduledoc """
  The ListeningSessions context.
  """

  import Ecto.Query, warn: false
  #  use Nebulex.Caching

  alias ProgRadioApi.Repo
  #  alias ProgRadioApi.Cache
  alias ProgRadioApi.{Stream, ListeningSession}

  @last_update_max_minutes 15

  #  @cache_prefix "listening_session_"
  #  @cache_ttl 90_000

  # Legacy: kept because not everyone will have the page refreshed with the new code
  # TODO remove after some time
  def get_listening_session!(id, %{"radio_stream_code_name" => radio_stream_code_name} = _attrs) do
    stream = Repo.get_by(Stream, radio_stream_code_name: radio_stream_code_name)

    case stream do
      nil -> nil
      _ -> Repo.get_by(ListeningSession, id: id, stream_id: stream.id)
    end
  end

  # Legacy: kept for old mobile apps for now
  # TODO remove after some time
  def get_listening_session!(id, %{"code_name" => stream_id} = _attrs) do
    with stream when not is_nil(stream) <- Repo.get(Stream, stream_id) do
      Repo.get_by(ListeningSession, id: id, stream_id: stream.id)
    else
      _ -> nil
    end
  end

  #  @decorate cacheable(
  #              cache: Cache,
  #              key: [@cache_prefix, stream_id],
  #              opts: [ttl: @cache_ttl]
  #            )
  def get_listening_session!(id, %{"stream_id" => stream_id} = _attrs) do
    #    with stream when not is_nil(stream) <- Repo.get(Stream, stream_id) do
    Repo.get_by(ListeningSession, id: id, stream_id: stream_id)
    #    else
    #      _ -> nil
    #    end
  end

  # find a session already created for the same stream / start / ip
  # (client sent a create while the previous create response was not received yet)
  def find_existing_listening_session(
        %{"stream_id" => stream_id, "date_time_start" => date_time_start},
        remote_ip
      )
      when is_binary(stream_id) and is_binary(date_time_start) do
    with {:ok, stream_uuid} <- Ecto.UUID.cast(stream_id),
         {:ok, date_time_start, _} <- DateTime.from_iso8601(date_time_start) do
      date_time_start = DateTime.truncate(date_time_start, :second)
      ip_binary = get_ip_as_binary(remote_ip)

      ListeningSession
      |> where(
        [ls],
        ls.stream_id == ^stream_uuid and ls.date_time_start == ^date_time_start and
          ls.ip_address == ^ip_binary
      )
      |> order_by([ls], desc: ls.date_time_end)
      |> limit(1)
      |> Repo.one()
    else
      _ -> nil
    end
  end

  def find_existing_listening_session(_attrs, _remote_ip), do: nil

  def create_listening_session(attrs, remote_ip \\ nil)

  # Legacy: kept because not everyone will have the page refreshed with the new code
  # TODO remove after some time
  def create_listening_session(
        %{"radio_stream_code_name" => radio_stream_code_name} = attrs,
        remote_ip
      )
      when is_map_key(attrs, "radio_stream_code_name") do
    ip_binary = get_ip_as_binary(remote_ip)

    Repo.get_by(Stream, radio_stream_code_name: radio_stream_code_name)
    |> Ecto.build_assoc(:listening_session, %ListeningSession{ip_address: ip_binary})
    |> ListeningSession.changeset(attrs)
    |> Repo.insert()
  end

  # Legacy: kept for old mobile apps for now
  # TODO remove after some time
  def create_listening_session(
        %{"id" => stream_id} = attrs,
        remote_ip
      ) do
    create_listening_session_of_stream(stream_id, attrs, remote_ip)
  end

  # listening session for streams
  def create_listening_session(%{"stream_id" => stream_id} = attrs, remote_ip)
      when is_map_key(attrs, "stream_id") do
    create_listening_session_of_stream(stream_id, attrs, remote_ip)
  end

  # the update of last_listening_at is also the check that the stream exists, no need to load it
  defp create_listening_session_of_stream(stream_id, attrs, remote_ip) do
    last_listening_at = DateTime.utc_now() |> DateTime.truncate(:second)

    query = from(s in Stream, where: s.id == ^stream_id)

    case Repo.update_all(query, set: [last_listening_at: last_listening_at]) do
      {1, _} ->
        %ListeningSession{stream_id: stream_id, ip_address: get_ip_as_binary(remote_ip)}
        |> ListeningSession.changeset(attrs)
        |> Repo.insert()

      _ ->
        {:error, nil}
    end
  end

  def update_listening_session(%ListeningSession{} = listening_session, attrs, remote_ip) do
    {:ok, new_date_time_end, _} =
      attrs
      |> Map.get("date_time_end")
      |> DateTime.from_iso8601()

    # we check the delta between last update and this one, if above a threshold we create a new
    # listening session instead (mostly to avoid computers waking up from sleep and resuming playing)
    case DateTime.diff(new_date_time_end, listening_session.date_time_end) do
      diff when diff / 60 > @last_update_max_minutes ->
        date_time_start =
          new_date_time_end
          |> DateTime.add(-30)
          |> DateTime.to_iso8601()

        attrs
        |> Map.put("date_time_start", date_time_start)
        #        |> Map.delete("id")
        |> create_listening_session(remote_ip)

      _ ->
        listening_session
        |> ListeningSession.changeset_update(attrs)
        |> Repo.update()
    end
  end

  defp get_ip_as_binary(remote_ip) do
    remote_ip
    |> Tuple.to_list()
    |> Enum.join(".")
  end
end
