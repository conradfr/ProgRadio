defmodule ProgRadioApi.ListeningSessions do
  @moduledoc """
  The ListeningSessions context.
  """

  import Ecto.Query, warn: false
  alias ProgRadioApi.Repo
  alias ProgRadioApi.Stream
  alias ProgRadioApi.RadioStream
  alias ProgRadioApi.ListeningSession

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

#  @doc """
#  Gets a single listening_session.
#
#  Raises `Ecto.NoResultsError` if the Listening session does not exist.
#
#  ## Examples
#
#      iex> get_listening_session!(123)
#      %ListeningSession{}
#
#      iex> get_listening_session!(456)
#      ** (Ecto.NoResultsError)
#
#  """
#  def get_listening_session!(id), do: Repo.get!(ListeningSession, id)

  @doc """
  Creates a listening_session.

  ## Examples

      iex> create_listening_session(%{field: value})
      {:ok, %ListeningSession{}}

      iex> create_listening_session(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_listening_session(attrs \\ %{}, remote_ip \\ nil)

  # listening session for radios
  def create_listening_session(%{"radio_stream_code_name" => radio_stream_code_name} = attrs, remote_ip) when is_map_key(attrs, "radio_stream_code_name")  do
   ip_binary = get_ip_as_binary(remote_ip)

    Repo.get_by(RadioStream, code_name: radio_stream_code_name)
    |> Ecto.build_assoc(:listening_session, %ListeningSession{ip_address: ip_binary})
    |> ListeningSession.changeset(attrs)
    |> Repo.insert()
  end

  # listening session for streams
  def create_listening_session(%{"stream_id" => stream_id} = attrs, remote_ip) when is_map_key(attrs, "stream_id")  do
    ip_binary = get_ip_as_binary(remote_ip)

    Repo.get(Stream, stream_id)
    |> Ecto.build_assoc(:listening_session, %ListeningSession{ip_address: ip_binary})
    |> ListeningSession.changeset(attrs)
    |> Repo.insert()
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

  defp get_ip_as_binary(remote_ip)do
    remote_ip
    |> Tuple.to_list()
    |> Enum.join(".")
  end

end
