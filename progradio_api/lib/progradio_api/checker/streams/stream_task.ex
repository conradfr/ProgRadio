defmodule ProgRadioApi.Checker.Streams.StreamTask do
  require Logger
  alias ProgRadioApi.Repo

  @timeout 50_000
  @success_status [200, 302]

  def start_link(radio_stream) do
    # Note: this function must return the format of `{:ok, pid}` and like
    # all children started by a Supervisor, the process must be linked
    # back to the supervisor (if you use `Task.start_link/1` then both
    # these requirements are met automatically)
    Task.start_link(fn ->
      Logger.info("Checking: #{radio_stream.code_name} (#{radio_stream.url})")

      try do
        HTTPoison.get!(radio_stream.url, %{},
          stream_to: self(),
          async: :once,
          timeout: @timeout,
          recv_timeout: @timeout,
          hackney: [pool: :checker]
        )
      rescue
        e in HTTPoison.Error ->
          case e.reason do
            reason when is_binary(reason) ->
              Logger.warn("Error (#{radio_stream.code_name}): #{e.reason}")

            reason when is_tuple(reason) ->
              {_error, {_error2, error_message}} = reason
              Logger.warn("Error (#{radio_stream.code_name}): #{to_string(error_message)}")
          end

          update_status(radio_stream, false)
      end

      receive do
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
end
