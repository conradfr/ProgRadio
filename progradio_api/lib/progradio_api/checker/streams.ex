defmodule ProgRadioApi.Checker.Streams do
  require Logger
  import Ecto.Query, only: [from: 2]
  alias ProgRadioApi.Repo
  alias ProgRadioApi.{Radio, RadioStream}

  @timeout 200_000
  @success_status [200, 302]

  @doc """
    We check all streams simultaneously which is a bit crude, that's why we set long timeouts as hackney pool gets overloaded
    todo: some genstage or other backpressure mechanism to pace the checks
  """
  def check() do
    get_radio_streams()
    |> Enum.each(fn radio_stream ->
      check_stream_of_radio(radio_stream)
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

  defp check_stream_of_radio(radio_stream) do
    Task.Supervisor.start_child(
      ProgRadioApi.TaskSupervisor,
      fn ->
        Logger.info("Checking: #{radio_stream.code_name} (#{radio_stream.url})")

        try do
          HTTPoison.get!(radio_stream.url, %{},
            stream_to: self(),
            async: :once,
            timeout: @timeout,
            recv_timeout: @timeout,
            ssl: [ciphers: :ssl.cipher_suites(), versions: [:"tlsv1.2", :"tlsv1.1", :tlsv1]]
          )
        rescue
          e in HTTPoison.Error ->
            Logger.warn("Error (#{radio_stream.code_name}): #{e.reason}")
            update_status(radio_stream, false)
        end

        receive do
          %HTTPoison.AsyncStatus{code: status_code} ->
            case status_code do
              s when s in @success_status ->
                update_status(radio_stream, true)

              _ ->
                Logger.warn("Error status (#{radio_stream.code_name}): #{status_code}")
                update_status(radio_stream, false)
            end

          message ->
            Logger.warn("Non-status received (#{radio_stream.code_name}): #{inspect(message)}")
            update_status(radio_stream, false)
        end
      end,
      [radio_stream]
    )
  end

  defp update_status(radio_stream, working) do
    retries =
      case working do
        true -> 0
        false -> radio_stream.retries + 1
      end

    radio_stream = Ecto.Changeset.change(radio_stream, %{status: working, retries: retries})
    Repo.update(radio_stream)
  end
end
