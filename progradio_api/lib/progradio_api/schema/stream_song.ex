defmodule ProgRadioApi.StreamSong do
  use Ecto.Schema
  alias ProgRadioApi.Stream

  schema "stream_song" do
    field(:code_name, :string)
    field(:enabled, :boolean)
    has_many(:stream, Stream)
  end
end
