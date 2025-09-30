defmodule ProgRadioApi.Checker.RadioStreams do
  require Logger
  import Ecto.Query, only: [from: 2]
  alias ProgRadioApi.Repo
  alias ProgRadioApi.{Radio, RadioStream}

  def check() do
    get_radio_streams()
    |> Enum.each(fn radio_stream ->
      try do
        ProgRadioApi.Checker.RadioStreams.Producer.async_notify(radio_stream)
      rescue
        e ->
          Logger.debug("Checking (request async) - (#{radio_stream.url}) - rescue")
          [:error, e]
      catch
        :exit, _ ->
          Logger.debug("Checking (request async) - (#{radio_stream.url}) - catch")
          [:error, nil]
      end
    end)

    :ok
  end

  defp get_radio_streams() do
    query =
      from(rs in RadioStream,
        join: r in Radio,
        on: r.id == rs.radio_id,
        where: r.active == true and rs.enabled == true and rs.id > 300 and rs.id < 400,
        order_by: [desc: rs.id]
      )

    Repo.all(query)
    |> IO.inspect()
  end
end
