defmodule Importer.Processor.Processor do
  require Logger
  use Timex
  alias Importer.Radio
  alias Importer.Processor.{Builder, Store}

  @date_format "{0D}-{0M}-{YYYY}"

  @spec process(String.t()) :: atom
  def process(key) do
    payload_raw = Redix.command!(:redix, ["GET", key])
    {:ok, date, radio} = process_payload(payload_raw)

    Importer.ProcessorMonitor.processed_entry(key, date, radio)
    :ok
  end

  @spec process_payload(String.t() | nil) :: {:ok, Date.t() | nil, String.t() | nil} | no_return
  defp process_payload(payload_raw)

  # If it was a stalled entry in queue, do nothing and let it get being cleaned off
  defp process_payload(payload_raw) when payload_raw === nil do
    {:ok, nil, nil}
  end

  defp process_payload(payload_raw) do
    with {:ok, payload} <- Jason.decode(payload_raw),
         radio when not is_nil(radio) <-
           Radio |> Importer.Repo.get_by(code_name: payload["radio"]),
         date when not is_nil(date) <-
           Timex.parse!(payload["date"], @date_format) |> Timex.to_date() do
      shows = Builder.build(payload["items"], radio)
      Store.persist(shows, radio, date)

      {:ok, date, radio.code_name}
    else
      _ -> raise("Error")
    end
  end
end
