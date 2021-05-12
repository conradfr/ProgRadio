defmodule ProgRadioApi.ListeningSession do
  import Ecto.Changeset
  use Ecto.Schema
  alias ProgRadioApi.RadioStream
  alias ProgRadioApi.Stream

  @time_length_minimum_seconds 30

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "listening_session" do
#    field(:next_id, :binary_id)
    field(:date_time_start, :utc_datetime)
    field(:date_time_end, :utc_datetime)
    field(:source, :string)
    field(:ip_address, :binary)
    belongs_to(:radio_stream, RadioStream)
    belongs_to(:stream, Stream, type: :binary_id)
  end

  @doc false
  def changeset(listening_session, attrs) do
    listening_session
    |> cast(attrs, [:date_time_start, :date_time_end, :source, :ip_address])
    |> validate_time_minimum()
    |> validate_required([:date_time_start, :date_time_end])
  end

  @doc false
  def changeset_update(listening_session, attrs) do
    listening_session
    |> cast(attrs, [:date_time_end])
    |> validate_time_minimum()
    |> validate_required([:date_time_end])
  end

  # listening time must have a minimum length
  defp validate_time_minimum(%{params: params} = changeset) do
    {:ok, date_time_start, _} =
      Map.get(params, "date_time_start")
      |> DateTime.from_iso8601()

    {:ok, date_time_end, _} =
      Map.get(params, "date_time_end")
      |> DateTime.from_iso8601()

    if DateTime.diff(date_time_end, date_time_start) < @time_length_minimum_seconds do
      %{changeset | valid?: false}
    else
      %{changeset | valid?: true}
    end
  end
end
