defmodule ProgRadioApi.RadioStream do
  use Ecto.Schema
  alias ProgRadioApi.Radio
  alias ProgRadioApi.ListeningSession

  schema "radio_stream" do
    field(:code_name, :string)
    field(:name, :string)
    field(:url, :string)
    field(:enabled, :boolean)
    field(:main, :boolean)
    field(:current_song, :boolean)
    belongs_to(:radio, Radio)
    has_many(:listening_session, ListeningSession)
  end
end
