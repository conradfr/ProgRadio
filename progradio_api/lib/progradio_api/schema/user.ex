defmodule ProgRadioApi.User do
  use Ecto.Schema

  alias ProgRadioApi.Stream

  schema "user" do
    field :email, :string
    field :locale, :string
    field :statistics_email, :boolean
    has_many(:streams, Stream)
  end
end
