defmodule ProgRadioApi.ListeningSessions do
  @moduledoc """
  The ListeningSessions context.
  """

  import Ecto.Query, warn: false
  #  use Nebulex.Caching

  alias ProgRadioApi.Repo
  #  alias ProgRadioApi.Cache
  alias ProgRadioApi.{Stream, RadioStream, ListeningSession}

  @last_update_max_minutes 15

  #  @cache_prefix "listening_session_"
  #  @cache_ttl 90_000

  #  @doc """
  #  Returns the list of listening_session.
  #
  #  ## Examples
  #
  #      iex> list_listening_session()
  #      [%ListeningSession{}, ...]
  #
  #  """
  #  def list_listening_session do
  #    Repo.all(ListeningSession)
  #  end

  #  @decorate cacheable(
  #              cache: Cache,
  #              key: [@cache_prefix, id],
  #              opts: [ttl: @cache_ttl]
  #            )
  def get_listening_session!(id), do: Repo.get!(ListeningSession, id)

  #  @decorate cacheable(
  #              cache: Cache,
  #              key: [@cache_prefix, radio_stream_code_name],
  #              opts: [ttl: @cache_ttl]
  #            )
  def get_listening_session!(id, %{"radio_stream_code_name" => radio_stream_code_name} = _attrs) do
    radio_stream = Repo.get_by(RadioStream, code_name: radio_stream_code_name)

    case radio_stream do
      nil -> nil
      _ -> Repo.get_by(ListeningSession, id: id, radio_stream_id: radio_stream.id)
    end
  end

  #  @decorate cacheable(
  #              cache: Cache,
  #              key: [@cache_prefix, stream_id],
  #              opts: [ttl: @cache_ttl]
  #            )
  def get_listening_session!(id, %{"stream_id" => stream_id} = _attrs) do
    with stream when not is_nil(stream) <- Repo.get(Stream, stream_id) do
      Repo.get_by(ListeningSession, id: id, stream_id: stream.id)
    else
      _ -> nil
    end
  end

  #  @decorate cacheable(
  #              cache: Cache,
  #              key: [@cache_prefix, code_name],
  #              opts: [ttl: @cache_ttl]
  #            )
  def get_listening_session!(id, %{"code_name" => code_name} = _attrs) do
    case Ecto.UUID.cast(code_name) do
      # not uuid, must be a radio_stream
      :error ->
        radio_stream = Repo.get_by(RadioStream, code_name: code_name)

        case radio_stream do
          nil -> nil
          _ -> Repo.get_by(ListeningSession, id: id, radio_stream_id: radio_stream.id)
        end

      _ ->
        Repo.get_by(ListeningSession, id: id, stream_id: code_name)
    end
  end

  @doc """
  Creates a listening_session.

  ## Examples

      iex> create_listening_session(%{field: value})
      {:ok, %ListeningSession{}}

      iex> create_listening_session(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_listening_session(attrs \\ %{}, remote_ip \\ nil)

  # listening session for radios or streams
  def create_listening_session(
        %{"id" => id} = attrs,
        remote_ip
      ) do
    case Ecto.UUID.cast(id) do
      # not uuid, must be a radio_stream
      :error ->
        attrs
        |> Map.put("radio_stream_code_name", id)
        |> Map.delete("id")
        |> create_listening_session(remote_ip)

      _ ->
        attrs
        |> Map.put("stream_id", id)
        |> Map.delete("id")
        |> create_listening_session(remote_ip)
    end
  end

  # listening session for radios
  def create_listening_session(
        %{"radio_stream_code_name" => radio_stream_code_name} = attrs,
        remote_ip
      )
      when is_map_key(attrs, "radio_stream_code_name") do
    ip_binary = get_ip_as_binary(remote_ip)

    Repo.get_by(RadioStream, code_name: radio_stream_code_name)
    |> Ecto.build_assoc(:listening_session, %ListeningSession{ip_address: ip_binary})
    |> ListeningSession.changeset(attrs)
    |> Repo.insert()
  end

  # listening session for streams
  def create_listening_session(%{"stream_id" => stream_id} = attrs, remote_ip)
      when is_map_key(attrs, "stream_id") do
    with %{} = stream <- Repo.get(Stream, stream_id) do
      params = %{
        "last_listening_at" => NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)
      }

      stream
      |> Stream.changeset_last_listening_at(params)
      |> Repo.update()

      ip_binary = get_ip_as_binary(remote_ip)

      stream
      |> Ecto.build_assoc(:listening_session, %ListeningSession{ip_address: ip_binary})
      |> ListeningSession.changeset(attrs)
      |> Repo.insert()
    else
      _ -> {:error, nil}
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
        |> Map.delete("id")
        |> create_listening_session(remote_ip)

      _ ->
        listening_session
        |> ListeningSession.changeset_update(attrs)
        |> Repo.update()
    end
  end

  #  @doc """
  #  Updates a listening_session.
  #
  #  ## Examples
  #
  #      iex> update_listening_session(listening_session, %{field: new_value})
  #      {:ok, %ListeningSession{}}
  #
  #      iex> update_listening_session(listening_session, %{field: bad_value})
  #      {:error, %Ecto.Changeset{}}
  #
  #  """
  #  def update_listening_session(%ListeningSession{} = listening_session, attrs) do
  #    listening_session
  #    |> ListeningSession.changeset(attrs)
  #    |> Repo.update()
  #  end

  #  @doc """
  #  Deletes a listening_session.
  #
  #  ## Examples
  #
  #      iex> delete_listening_session(listening_session)
  #      {:ok, %ListeningSession{}}
  #
  #      iex> delete_listening_session(listening_session)
  #      {:error, %Ecto.Changeset{}}
  #
  #  """
  #  def delete_listening_session(%ListeningSession{} = listening_session) do
  #    Repo.delete(listening_session)
  #  end

  #  @doc """
  #  Returns an `%Ecto.Changeset{}` for tracking listening_session changes.
  #
  #  ## Examples
  #
  #      iex> change_listening_session(listening_session)
  #      %Ecto.Changeset{data: %ListeningSession{}}
  #
  #  """
  #  def change_listening_session(%ListeningSession{} = listening_session, attrs \\ %{}) do
  #    ListeningSession.changeset(listening_session, attrs)
  #  end

  defp get_ip_as_binary(remote_ip) do
    remote_ip
    |> Tuple.to_list()
    |> Enum.join(".")
  end
end
