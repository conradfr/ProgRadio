defmodule ProgRadioApi.Checker.Streams.Producer do
  use GenStage
  require Logger
  import Ecto.Query, only: [from: 2]

  alias ProgRadioApi.Repo
  alias ProgRadioApi.Stream

  # The consumer only asks for more events once enough of its children have
  # terminated (`min_demand`), so when the query returns less streams than
  # asked the pipeline would stall forever. We keep the unfulfilled demand and
  # poll again after this delay to keep it alive.
  @poll_interval 300_000

  def start_link(_arg) do
    GenStage.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  ## Callbacks

  def init(:ok) do
    {:producer, %{pending_demand: 0, timer: nil}}
  end

  def handle_demand(demand, state) when demand > 0 do
    state
    |> cancel_timer()
    |> Map.update!(:pending_demand, &(&1 + demand))
    |> dispatch()
  end

  def handle_info(:poll, state) do
    dispatch(%{state | timer: nil})
  end

  def handle_info(_message, state) do
    {:noreply, [], state}
  end

  ## Internals

  defp dispatch(%{pending_demand: 0} = state), do: {:noreply, [], state}

  defp dispatch(%{pending_demand: demand} = state) do
    streams = get_streams(demand)
    found = length(streams)

    Logger.info("Streams Error Check - Producer: handling demand #{demand}, found: #{found}")

    state = %{state | pending_demand: demand - found}

    {:noreply, streams, maybe_schedule_poll(state)}
  end

  # we take <demand> random streams with errors
  defp get_streams(demand) do
    # ignoring dash and forced hls for now
    query =
      from s in Stream,
        select: s,
        #            fragment("? not ilike '%.m3u8%'", s.stream_url) and
        where:
          s.enabled == true and s.banned == false and is_nil(s.redirect_to) and
            s.playing_error > 0 and s.force_mpd == false and s.force_hls == false and
            fragment("? not ilike '%.mpd%'", s.stream_url),
        order_by: fragment("RANDOM()"),
        limit: ^demand

    Repo.all(query)
  end

  # demand fully satisfied: the consumer will ask again by itself
  defp maybe_schedule_poll(%{pending_demand: 0} = state), do: state

  defp maybe_schedule_poll(%{timer: timer} = state) when is_reference(timer), do: state

  defp maybe_schedule_poll(state) do
    %{state | timer: Process.send_after(self(), :poll, @poll_interval)}
  end

  defp cancel_timer(%{timer: nil} = state), do: state

  defp cancel_timer(%{timer: timer} = state) do
    Process.cancel_timer(timer)
    %{state | timer: nil}
  end
end
