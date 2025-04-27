defmodule ProgRadioApi.AutoUpdater.RadioStreams do
  require Logger
  import Ecto.Query, only: [from: 2]
  alias ProgRadioApi.Repo
  alias ProgRadioApi.{Radio, RadioStream, RadioStreamUpdate}

  def auto_update() do
    get_radio_streams()
    |> Enum.each(fn radio_stream ->
      ProgRadioApi.AutoUpdater.RadioStreams.Producer.sync_notify(radio_stream)
    end)

    :ok
  end

  defp get_radio_streams() do
    query =
      from(rs in RadioStream,
        join: r in Radio,
        on: r.id == rs.radio_id,
        join: rsu in RadioStreamUpdate,
        on: rs.id == rsu.radio_stream_id,
        where: r.active == true and rs.enabled == true and not is_nil(rsu.id),
        order_by: [desc: rs.id],
        preload: [:radio_stream_update]
      )

    Repo.all(query)
  end
end
