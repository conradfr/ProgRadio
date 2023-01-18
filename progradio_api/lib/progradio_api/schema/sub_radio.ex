defmodule ProgRadioApi.SubRadio do
  use Ecto.Schema
  alias ProgRadioApi.{Radio, RadioStream, ScheduleEntry}

  schema "sub_radio" do
    field(:code_name, :string)
    field(:name, :string)
    field(:enabled, :boolean)
    field(:main, :boolean)
    belongs_to(:radio, Radio)
    has_one(:radio_stream, RadioStream)
    has_many(:schedule_entry, ScheduleEntry)
  end
end
