defmodule ProgRadioApi.Cache do
  use Nebulex.Cache,
    otp_app: :progradio_api,
    adapter: Nebulex.Adapters.Local

  # Nebulex v3 removed dispatch_stats/0, this emits the same telemetry event for the periodic poller
  def dispatch_stats() do
    case info(:stats) do
      {:ok, stats} when is_map(stats) ->
        :telemetry.execute([:prog_radio_api, :cache, :stats], stats, %{cache: __MODULE__})

      _ ->
        :ok
    end
  end
end
