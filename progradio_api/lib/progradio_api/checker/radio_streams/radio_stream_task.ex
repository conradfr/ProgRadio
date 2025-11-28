defmodule ProgRadioApi.Checker.RadioStreams.RadioStreamTask do
  require Logger
  alias ProgRadioApi.Repo
  alias ProgRadioApi.RadioStream

  @max_redirects 5

  def start_link(%RadioStream{} = radio_stream) do
    Task.start_link(fn ->
      Logger.info("Checking: #{radio_stream.code_name} (#{radio_stream.url})")
      fetch(radio_stream)
    end)
  end

  defp fetch(radio_stream, loop_count \\ 0)

  defp fetch(%RadioStream{} = radio_stream, loop_count) when loop_count > @max_redirects do
    Logger.debug("Checking: #{radio_stream.code_name} : max loop reached")
    [:error, nil]
  end

  defp fetch(%RadioStream{} = radio_stream, loop_count) do
    try do
      result =
        case String.contains?(radio_stream.url, ".m3u8") do
          true ->
            radio_stream.url
            |> request_file()
            |> Map.get(:body)
            |> HLS.parse()
            |> Map.get(:lines)
            |> Enum.find_value(fn
              %HLS.M3ULine{type: :uri} = line ->
                case String.contains?(line.value, ".m3u8") do
                  true ->
                    fetch(
                      %{radio_stream | url: build_url(radio_stream, line.value)},
                      loop_count + 1
                    )

                  false ->
                    radio_stream |> build_url(line.value) |> request_stream()
                end

              _e ->
                false
            end)

          false ->
            request_stream(radio_stream.url)
        end

      case result do
        :ok -> update_status(radio_stream, true)
        _ -> update_status(radio_stream, false)
      end
    rescue
      e ->
        Logger.debug("Checking - #{radio_stream.code_name} (#{radio_stream.url}) - rescue")
        update_status(radio_stream, false)
    catch
      :exit, _ ->
        Logger.debug("Checking - #{radio_stream.code_name} (#{radio_stream.url}) - catch")
        update_status(radio_stream, false)
    end
  end

  # maybe this could be done on another stage
  defp update_status(radio_stream, working) do
    Logger.debug("Checking: #{radio_stream.code_name} (#{radio_stream.url}) : #{working}")

    retries =
      case working do
        true -> 0
        false -> radio_stream.retries + 1
      end

    radio_stream = Ecto.Changeset.change(radio_stream, %{status: working, retries: retries})
    Repo.update!(radio_stream)
  end

  defp request_file(stream_url) when is_binary(stream_url) do
    try do
      Req.get!(
        stream_url,
        headers: [{"Cache-Control", "no-cache"}, {"Pragma", "no-cache"}],
        redirect: true,
        max_redirects: @max_redirects
        #          timeout: @req_timeout,
        #          transport_opts: [verify: :verify_none]
        #        ],
        #        receive_timeout: @req_timeout,
      )
    rescue
      e ->
        Logger.debug("Checking (request) - (#{stream_url}) - rescue")
        [:error, e]
    catch
      :exit, _ ->
        Logger.debug("Checking (request) - (#{stream_url}) - catch")
        [:error, nil]
    end
  end

  defp request_stream(stream_url) when is_binary(stream_url) do
    try do
      case Req.get!(
             stream_url,
             headers: [{"Cache-Control", "no-cache"}, {"Pragma", "no-cache"}],
             redirect: true,
             max_redirects: @max_redirects,
             connect_options: [
               #          timeout: @req_timeout,
               transport_opts: [verify: :verify_none]
             ],
             #        receive_timeout: @req_timeout,
             retry: false,
             into: fn {:data, _data}, {req, resp} ->
               {:halt, {req, resp}}
             end
           ) do
        %Req.Response{status: 200, headers: %{"content-type" => ["audio/" <> _mime]}} =
            _resp ->
          #            Req.cancel_async_response(resp)
          :ok

        %Req.Response{status: 200, headers: %{"content-type" => ["video/" <> _mime]}} =
            _resp ->
          #            Req.cancel_async_response(resp)
          :ok

        _resp ->
          #          Req.cancel_async_response(resp)
          [:error, nil]
      end
    rescue
      e ->
        Logger.debug("Checking (request async) - (#{stream_url}) - rescue")
        [:error, e]
    catch
      :exit, _ ->
        Logger.debug("Checking (request async) - (#{stream_url}) - catch")
        [:error, nil]
    end
  end

  defp build_url(%RadioStream{} = _radio_stream, "http" <> _url_rest = url) do
    url
  end

  defp build_url(%RadioStream{url: base_url} = _radio_stream = _args, url) do
    base_url
    |> String.trim_trailing("/")
    |> String.split("/")
    |> Enum.reverse()
    |> Enum.drop(1)
    |> Enum.reverse()
    |> Enum.join("/")
    |> then(&(&1 <> "/" <> String.trim_leading(url, "/")))
  end
end
