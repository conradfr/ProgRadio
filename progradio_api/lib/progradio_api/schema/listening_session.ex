defmodule ProgRadioApi.ListeningSession do
  import Ecto.Changeset
  use Ecto.Schema
  alias ProgRadioApi.RadioStream
  alias ProgRadioApi.Stream

  @time_length_minimum_seconds 15

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "listening_session" do
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
    # sometimes values are nil for some reason (bug?)
    with date_time_start_param when not is_nil(date_time_start_param) <- Map.get(params, "date_time_start"),
         date_time_end_param when not is_nil(date_time_end_param) <- Map.get(params, "date_time_end"),
         {:ok, date_time_start, _} <- DateTime.from_iso8601(date_time_start_param),
         {:ok, date_time_end, _} <- DateTime.from_iso8601(date_time_end_param) do
      if DateTime.diff(date_time_end, date_time_start) < @time_length_minimum_seconds do
        %{changeset | valid?: false}
      else
        %{changeset | valid?: true}
      end
    else
      _ ->
        %{changeset | valid?: false}
    end
  end
end
