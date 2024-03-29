defmodule ProgRadioApi.Importer.ScheduleImporter.Processor do
  require Logger
  use Timex
  alias ProgRadioApi.Repo
  alias ProgRadioApi.{Radio, SubRadio}
  alias ProgRadioApi.Importer.ScheduleImporter.{Builder, Store}

  @date_format "{0D}-{0M}-{YYYY}"

  @spec process(String.t()) :: atom
  def process(key) do
    payload_raw = Redix.command!(:redix, ["GET", key])
    process_payload(payload_raw)
  end

  @spec process_payload(String.t() | nil) :: {:ok, Date.t() | nil, String.t() | nil} | no_return
  defp process_payload(payload_raw)

  # If it was a stalled entry in queue, do nothing and let it get being cleaned off
  defp process_payload(payload_raw) when payload_raw === nil do
    {:ok, nil, nil}
  end

  defp process_payload(payload_raw) do
    with {:ok, payload} <- Jason.decode(payload_raw),
         %Radio{} = radio <- Repo.get_by(Radio, code_name: payload["radio"]),
         %SubRadio{} = sub_radio <- Repo.get_by(SubRadio, code_name: payload["sub_radio"]),
         date when not is_nil(date) <-
           Timex.parse!(payload["date"], @date_format) |> Timex.to_date() do
      shows = Builder.build(payload["items"], radio, sub_radio)

      Store.persist(shows, radio, sub_radio, date)

      {:ok, date, radio.code_name, sub_radio.code_name}
    else
      _ -> raise("Error")
    end
  end
end
