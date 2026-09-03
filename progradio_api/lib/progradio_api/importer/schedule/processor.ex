defmodule ProgRadioApi.Importer.ScheduleImporter.Processor do
  alias ProgRadioApi.Repo
  alias ProgRadioApi.{Radio, Stream}
  alias ProgRadioApi.Importer.ScheduleImporter.{Builder, Store}

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
         %Stream{} = stream <-
           Repo.get_by(Stream, radio_stream_code_name: payload["sub_radio"], is_sub_radio: true),
         date when not is_nil(date) <- parse_date(payload["date"]) do
      shows = Builder.build(payload["items"], radio, stream)

      Store.persist(shows, radio, stream, date)

      {:ok, date, radio.code_name, stream.radio_stream_code_name}
    else
      _ -> raise("Error")
    end
  end

  # Expects a zero-padded DD-MM-YYYY date
  @spec parse_date(String.t() | any) :: Date.t() | nil
  defp parse_date(date_string)

  defp parse_date(<<day::binary-2, "-", month::binary-2, "-", year::binary-4>>) do
    case Date.from_iso8601(year <> "-" <> month <> "-" <> day) do
      {:ok, date} -> date
      {:error, _} -> nil
    end
  end

  defp parse_date(_date_string), do: nil
end
