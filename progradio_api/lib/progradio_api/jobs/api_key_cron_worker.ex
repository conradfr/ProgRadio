defmodule ProgRadioApi.ApiKeyCronWorker do
  @moduledoc """
  Generate rolling keys for the stream proxy
  """

  use Oban.Worker, queue: :cron
  require Logger

  @redis_key "stream_proxy_keys"
  @max_keys 10

  @letters Enum.concat(?a..?z, ?A..?Z)
  @numbers ?0..?9
  @letters_count 15
  @numbers_count 4

  @impl Oban.Worker
  def perform(%Oban.Job{args: _args}) do
    Logger.debug("Api key cron worker")

    # newest key first, we only keep the last @max_keys
    Redix.transaction_pipeline!(:redix, [
      ["LPUSH", @redis_key, generate_key()],
      ["LTRIM", @redis_key, 0, @max_keys - 1]
    ])

    :ok
  end

  defp generate_key() do
    # use the crypto strong generator for this process
    :crypto.rand_seed()

    letters = for _ <- 1..@letters_count, do: Enum.random(@letters)
    numbers = for _ <- 1..@numbers_count, do: Enum.random(@numbers)

    (letters ++ numbers)
    |> Enum.shuffle()
    |> List.to_string()
  end
end
