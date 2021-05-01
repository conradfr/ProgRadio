defmodule ProgRadioApi.Importer.ScheduleImporter do
  require Logger
  use Broadway
  alias ProgRadioApi.Importer.ScheduleCache

  @queue_list "schedule_input:queue"
  @queue_processing "schedule_input:processing"

  @cache_prefix "schedule_"

  def start_link(_opts) do
    Broadway.start_link(ProgRadioApi.Importer.ScheduleImporter,
      name: ScheduleImporterQueue,
      producer: [
        module: {
          OffBroadway.Redis.Producer,
          redis_instance: :redix, list_name: @queue_list, working_list_name: @queue_processing
        },
        concurrency: 1
      ],
      processors: [
        default: [concurrency: 4]
      ],
      batchers: [
        default: [
          concurrency: 2,
          batch_size: 10,
          batch_timeout: 10000
        ]
      ]
    )
  end

  @impl true
  def handle_message(_, message, _) do
    {:ok, date, radio_name} =
      ProgRadioApi.Importer.ScheduleImporter.Processor.process(message.data)

    message
    |> Broadway.Message.update_data(fn m ->
      %{key: m, date: date, radio_name: radio_name}
    end)
  end

  @impl Broadway
  def handle_batch(:default, messages, _, _) do
    Logger.debug("Batching: #{Kernel.length(messages)} entries")

    # delete cache
    messages
    |> Enum.each(fn m ->
      Cachex.del(
        :progradio_cache,
        @cache_prefix <> Date.to_iso8601(m.data.date) <> "_" <> m.data.radio_name
      )

      ScheduleCache.remove(m.data.date, m.data.radio_name)
    end)

    # delete redis data entries
    messages
    |> Enum.reduce([], fn m, acc ->
      acc ++ [m.data.key]
    end)
    |> (&Redix.command(:redix, ["DEL"] ++ &1)).()

    messages
  end
end
