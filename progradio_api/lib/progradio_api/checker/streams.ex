defmodule ProgRadioApi.Checker.Streams do
  require Logger
  import Ecto.Query, only: [from: 2]
  alias ProgRadioApi.Repo
  alias ProgRadioApi.{Radio, RadioStream}

  @timeout 10_000
  @success_status [200, 302]

  def check() do
    get_radio_streams()
    |> Enum.each(fn radio_stream ->
      ProgRadioApi.Checker.Streams.Producer.sync_notify(radio_stream)
    end)

    :ok
  end

  defp get_radio_streams() do
    query =
      from(rs in RadioStream,
        join: r in Radio,
        on: r.id == rs.radio_id,
        where: r.active == true,
        order_by: [desc: rs.id]
      )

    Repo.all(query)
  end
end
