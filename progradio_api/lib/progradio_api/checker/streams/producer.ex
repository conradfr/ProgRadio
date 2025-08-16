defmodule ProgRadioApi.Checker.Streams.Producer do
  use GenStage
  import Ecto.Query, only: [from: 2]

  alias ProgRadioApi.Repo
  alias ProgRadioApi.Stream

  def start_link(_arg) do
    GenStage.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  def sync_notify(event, timeout \\ 360_000) do
    GenStage.call(__MODULE__, {:notify, event}, timeout)
  end

  ## Callbacks

  def init(:ok) do
    {:producer, nil}
  end

  # we take <demand> random streams with errors
  def handle_demand(demand, _state) when demand > 0 do
    # ignoring hls/dash for now
    query =
      from s in Stream,
        select: s,
        where:
          s.enabled == true and s.banned == false and is_nil(s.redirect_to) and
            s.playing_error > 0 and
            s.force_hls == false and s.force_mpd == false and
            fragment("? not ilike '%.m3u8%'", s.stream_url) and
            fragment("? not ilike '%.mpd%'", s.stream_url),
        order_by: fragment("RANDOM()"),
        limit: ^demand

    {:noreply, Repo.all(query), nil}
  end
end
