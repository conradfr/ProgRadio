defmodule ProgRadioApi.StreamSong do
  use Ecto.Schema
  alias ProgRadioApi.Stream
  alias ProgRadioApi.Repo

  schema "stream_song" do
    field(:code_name, :string)
    field(:enabled, :boolean)
    has_many(:stream, Stream)
  end

  @spec update_status(integer, boolean) :: any
  def update_status(id, increment) do
    query_end =
      case increment do
        false -> "0"
        true -> "retries + 1"
      end

    Repo.query(
      "UPDATE stream_song SET retries = " <> query_end <> " WHERE id = $1;",
      [id]
    )
  end
end
