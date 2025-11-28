defmodule ProgRadioApi.EmailStatsSendWorker do
  use Oban.Worker, queue: :email_stats
  import Ecto.Query, warn: false, only: [from: 2]
  require Logger

  alias ProgRadioApi.Repo
  alias ProgRadioApi.SendMail
  alias ProgRadioApi.{Stream, ListeningSession}

  @sleep_ms 500

  @impl Oban.Worker
  def perform(%Oban.Job{args: args}) do
    Logger.debug("Email stats send worker")

    # kind of anti-spam detection prevention
    Process.sleep(@sleep_ms)

    stats =
      args["stream_ids"]
      |> get_stats()
      |> format_stats()

    # For now we use the main app to send mail
    Req.post!(
      Application.fetch_env!(:progradio_api, :webhook_url),
      json: %{
        event: "send_user_stream_stats",
        event_id: System.os_time(:microsecond) |> Integer.to_string(),
        user_id: args["user_id"],
        stats: stats
      },
      headers: [
        {"x-secret", Application.fetch_env!(:progradio_api, :webhook_secret)},
        {"content-type", "application/json"}
      ],
      connect_options: [
        transport_opts: [
          middlebox_comp_mode: false,
          verify: :verify_none
        ]
      ]
    )

    :ok
  end

  defp get_stats(stream_ids) do
    # thanks Claude
    today = Date.utc_today()
    last_of_previous_month = Date.add(%{today | day: 1}, -1)
    first_of_previous_month = %{last_of_previous_month | day: 1}

    from(s in Stream,
      left_join: ls in ListeningSession,
      on: s.id == ls.stream_id,
      where: s.id in ^stream_ids,
      group_by: [s.id],
      select: %{
        id: s.id,
        name: s.name,
        total_seconds:
          fragment(
            "COALESCE(SUM(EXTRACT(EPOCH FROM (? - ?))), 0)",
            ls.date_time_end,
            ls.date_time_start
          ),
        total_sessions: fragment("COALESCE(COUNT(DISTINCT ?), 0)", ls.id)
      }
    )
    |> Repo.all()
  end

  defp format_stats(stats) do
    Enum.map(stats, fn e ->
      total_seconds = Decimal.to_integer(e.total_seconds)
      days = div(total_seconds, 86400)
      remaining = rem(total_seconds, 86400)

      hours = div(remaining, 3600)
      remaining = rem(remaining, 3600)

      minutes = div(remaining, 60)
      seconds = rem(remaining, 60)

      %{
        name: e.name,
        total_sessions: e.total_sessions,
        total_time:
          Duration.new!(day: days, hour: hours, minute: minutes, second: seconds)
          |> Duration.to_string()
      }
    end)
  end
end
