defmodule ProgRadioApi.User do
  use Ecto.Schema
  import Ecto.Changeset

  alias ProgRadioApi.Stream

  schema "user" do
    field :email, :string
    field :locale, :string
    field :statistics_email, :boolean
    has_many(:tests, Stream)
  end
end
