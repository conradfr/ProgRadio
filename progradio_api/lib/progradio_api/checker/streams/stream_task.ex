defmodule ProgRadioApi.Checker.Streams.StreamTask do
  require Logger
  alias ProgRadioApi.Repo

  @timeout 20_000
  @success_status [200, 302]

  def start_link(radio_stream) do
    Task.start_link(fn ->
      Logger.info("Checking: #{radio_stream.code_name} (#{radio_stream.url})")

      resp = make_request(radio_stream.url, radio_stream)

      async_receive = fn resp, async_fn ->
        receive do
          %HTTPoison.AsyncRedirect{headers: headers} ->
            redirect_url =
              headers
              |> Enum.find(fn h ->
                match?({"location", _}, h) ||
                  match?({"Location", _}, h)
              end)
              |> elem(1)

            Logger.debug("Check (#{radio_stream.code_name}), redirect to #{redirect_url}")

            make_request(redirect_url, radio_stream)
            async_fn.(resp, async_fn)

          %HTTPoison.AsyncStatus{code: status_code} ->
            case status_code do
              s when s in @success_status ->
                Logger.debug("Success check (#{radio_stream.code_name})")
                update_status(radio_stream, true)

              _ ->
                Logger.warn("Error status (#{radio_stream.code_name}): #{status_code}")
                update_status(radio_stream, false)
            end

          message ->
            Logger.warn("Non-status received (#{radio_stream.code_name}): #{inspect(message)}")
            update_status(radio_stream, false)
        end
      end

      async_receive.(resp, async_receive)
    end)
  end

  # maybe this could be done on another stage
  defp update_status(radio_stream, working) do
    retries =
      case working do
        true -> 0
        false -> radio_stream.retries + 1
      end

    radio_stream = Ecto.Changeset.change(radio_stream, %{status: working, retries: retries})
    Repo.update(radio_stream)
  end

  defp make_request(url, radio_stream) do
    try do
      HTTPoison.get!(url, %{},
        stream_to: self(),
        async: :once,
        follow_redirect: true,
        timeout: @timeout,
        recv_timeout: @timeout,
        hackney: [pool: :checker, insecure: true]
      )
    rescue
      e in HTTPoison.Error ->
        case e.reason do
          reason when is_binary(reason) ->
            Logger.warn("Error (#{radio_stream.code_name}): #{e.reason}")

          reason when reason == :checkout_timeout ->
            Logger.warn(
              "Error (#{radio_stream.code_name}): checkout_timeout - restarting pool ..."
            )

            :hackney_pool.stop_pool(:checker)

          reason when is_tuple(reason) and tuple_size(reason) == 2 ->
            {_error, {_error2, error_message}} = reason
            Logger.warn("Error (#{radio_stream.code_name}): #{to_string(error_message)}")

          unknown ->
            Logger.warn("Error (#{radio_stream.code_name}): #{to_string(unknown)}")
        end

        update_status(radio_stream, false)
    end
  end
end
