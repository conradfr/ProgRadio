defmodule ProgRadioApi.AutoUpdater.Streams do
  require Logger
  import Ecto.Query, only: [from: 2]
  alias ProgRadioApi.Repo
  alias ProgRadioApi.{Stream, StreamAutoUpdate}

  def auto_update() do
    Logger.info("Streams auto-updater: task starting ...")

    get_streams()
    |> Enum.each(fn stream ->
      ProgRadioApi.AutoUpdater.Streams.Producer.sync_notify(stream)
    end)

    :ok
  end

  defp get_streams() do
    # todo set columns
    query =
      from(s in Stream,
        join: su in StreamAutoUpdate,
        on: s.id == su.stream_id,
        where:
          s.enabled == true and s.banned == false and is_nil(s.redirect_to) and not is_nil(su.id),
        preload: [:stream_auto_update]
      )

    streams = Repo.all(query)

    query =
      from(s in Stream,
        where:
          s.enabled == true and s.banned == false and is_nil(s.redirect_to) and
            fragment("? ilike '%.radio12345.com%'", s.website),
        preload: [:stream_auto_update]
      )

    radio12345_streams = Repo.all(query)

    streams ++ radio12345_streams
  end
end
