defmodule ProgRadioApi.Checker.Streams.StreamTask do
  require Logger
  alias ProgRadioApi.Repo
  alias ProgRadioApi.Stream

  def start_link(%Stream{} = stream) do
    # ignoring hls/dash for now
    #    if String.contains?(stream.stream_url, ".m3u8") == false and String.contains?(stream.stream_url, ".mpd") == false
    #      and stream.force_hls == false and stream.force_mpd == false do
    Task.start_link(fn ->
      Logger.info("Checking: #{stream.id} (#{stream.stream_url})")

      try do
        case request(stream.stream_url) do
          %Req.Response{status: 200, headers: %{"content-type" => ["audio/" <> _mime]}} =
              resp ->
            Req.cancel_async_response(resp)
            reset_errors(stream)

          resp ->
            Req.cancel_async_response(resp)
        end
      rescue
        _ ->
          Logger.debug("Checking - #{stream.id} (#{stream.stream_url}) - rescue")
      catch
        :exit, _ ->
          Logger.debug("Checking - #{stream.id} (#{stream.stream_url}) - catch")
      end
    end)

    #    else
    #      {:error, :ignored}
    #    end
  end

  defp request(stream_url) when is_binary(stream_url) do
    Req.get!(
      stream_url,
      headers: [{"Cache-Control", "no-cache"}, {"Pragma", "no-cache"}],
      redirect: true,
      connect_options: [timeout: 15_000],
      retry: false,
      into: :self
    )
  end

  # maybe this could be done on another stage

  defp reset_errors(%Stream{} = stream) do
    IO.puts("----------------------------------------")
    Logger.debug("Resetting errors #{stream.id} (#{stream.stream_url})")

    stream
    |> Stream.changeset_playing_error(%{"playing_error" => 0, "playing_error_reason" => nil})
    |> Repo.update()
  end

  defp check_error(%Stream{} = stream) do
    :todo
  end
end
