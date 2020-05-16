defmodule Importer.Checker.Streams do
  require Logger
  import Ecto.Query, only: [from: 2]
  alias Importer.Repo
  alias Importer.Radio

  @timeout 100_000
  @success_status [200, 302]

  @doc """
    We check all streams simultaneously which is a bit crude, that's why we set long timeouts as hackney pool gets overloaded
    todo: some genstage or other backpressure mechanism to pace the checks
  """
  def check() do
    get_radios()
    |> Enum.each(fn radio ->
      check_stream_of_radio(radio)
    end)

    :ok
  end

  defp get_radios() do
    query =
      from(r in Radio,
        where: r.active == true,
        order_by: [desc: :id]
      )

    Repo.all(query)
  end

  defp check_stream_of_radio(radio) do
    Task.Supervisor.start_child(
      Importer.TaskSupervisor,
      fn ->
        Logger.info("Checking: #{radio.code_name} (#{radio.streaming_url})")

        try do
          HTTPoison.get!(radio.streaming_url, %{}, [stream_to: self(), async: :once, timeout: @timeout, recv_timeout: @timeout, ssl: [ciphers: :ssl.cipher_suites(), versions: [:"tlsv1.2", :"tlsv1.1", :tlsv1]]])
          rescue
            e in HTTPoison.Error ->
              Logger.warn("Error (#{radio.code_name}): #{e.reason}")
              update_status(radio, false)
        end

        receive do
          %HTTPoison.AsyncStatus{code: status_code} ->
            case status_code do
              s when s in @success_status -> update_status(radio, true)
              _ ->
                Logger.warn("Error status (#{radio.code_name}): #{status_code}")
                update_status(radio, false)
            end
          message ->
            Logger.warn("Non-status received (#{radio.code_name}): #{inspect message}")
            update_status(radio, false)
        end
      end,
      [radio]
    )
  end

  defp update_status(radio, working) do
    retries =
      case working do
        true -> 0
        false -> radio.streaming_retries + 1
      end

    radio = Ecto.Changeset.change radio, %{streaming_status: working, streaming_retries: retries}
    Repo.update(radio)
  end
end
