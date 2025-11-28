defmodule ProgRadioApi.EmailStatsCronWorker do
  use Oban.Worker, queue: :cron
  import Ecto.Query, warn: false, only: [from: 2]
  require Logger

  alias ProgRadioApi.Repo
  alias ProgRadioApi.{Stream, User}
  alias ProgRadioApi.EmailStatsSendWorker

  @impl Oban.Worker
  def perform(%Oban.Job{args: _args}) do
    Logger.debug("Cron worker")

    from(s in Stream,
      join: u in User,
      on: u.id == s.user_id,
      where: s.enabled == true,
      where: s.banned == false,
      where: is_nil(s.redirect_to),
      where: u.statistics_email == true,
      group_by: [u.id],
      select: %{
        total: count(),
        stream_ids: fragment("array_agg(?)", s.id),
        user_id: u.id
      }
    )
    |> Repo.all()
    |> Enum.each(fn e ->
      stream_ids =
        Enum.map(e.stream_ids, fn id ->
          {:ok, uuid} = Ecto.UUID.cast(id)
          uuid
        end)

      %{user_id: e.user_id, stream_ids: stream_ids}
      |> EmailStatsSendWorker.new()
      |> Oban.insert()
    end)

    :ok
  end
end
