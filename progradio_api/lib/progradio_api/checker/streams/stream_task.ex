defmodule ProgRadioApi.Checker.Streams.StreamTask do
  require Logger
  alias ProgRadioApi.Repo
  alias ProgRadioApi.Stream

  # TODO probably mutualize code w/ radio_stream_task.ex

  @max_redirects 5

  def start_link(%Stream{} = stream) do
    Task.start_link(fn ->
      Logger.info("Checking: #{stream.id} (#{stream.stream_url})")
      fetch(stream)
    end)
  end

  #  stream = ProgRadioApi.Repo.get(ProgRadioApi.Stream, "a93e7e66-836e-4077-bb4d-dc1124e68506")
  # ProgRadioApi.Checker.Streams.StreamTask.fetch(stream)

  def fetch(stream, loop_count \\ 0)

  def fetch(%Stream{} = stream, loop_count) when loop_count > @max_redirects do
    Logger.debug("Checking: #{stream.id} : max loop reached")
    [:error, nil]
  end

  def fetch(%Stream{} = stream, loop_count) do
    try do
      result =
        case String.contains?(stream.stream_url, ".m3u8") do
          true ->
            stream.stream_url
            |> request_file()
            |> Map.get(:body)
            |> HLS.parse()
            |> Map.get(:lines)
            |> Enum.find_value(fn
              %HLS.M3ULine{type: :uri} = line ->
                case String.contains?(line.value, ".m3u8") do
                  true ->
                    fetch(%{stream | stream_url: build_url(stream, line.value)}, loop_count + 1)

                  false ->
                    stream |> build_url(line.value) |> request_stream()
                end

              _e ->
                false
            end)

          false ->
            request_stream(stream.stream_url)
        end

      case result do
        :ok -> reset_errors(stream)
        _ -> :ok
      end
    rescue
      _e ->
        Logger.debug("Checking - #{stream.id} (#{stream.stream_url}) - rescue")
        :ok
    catch
      :exit, _ ->
        Logger.debug("Checking - #{stream.id} (#{stream.stream_url}) - catch")
        :ok
    end
  end

  defp request_file(stream_url) when is_binary(stream_url) do
    try do
      Req.get!(
        stream_url,
        headers: [{"Cache-Control", "no-cache"}, {"Pragma", "no-cache"}],
        redirect: true,
        max_redirects: @max_redirects
        #        connect_options: [
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
               transport_opts: [
                 middlebox_comp_mode: false,
                 verify: :verify_none
               ]
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

        %Req.Response{status: 200} =
            _resp ->
          #            Req.cancel_async_response(resp)
          [:error, "Not an audio or video stream"]

        %Req.Response{status: 404} =
            _resp ->
          #            Req.cancel_async_response(resp)
          [:error, "Not found (404)"]

        %Req.Response{status: 500} =
            _resp ->
          #            Req.cancel_async_response(resp)
          [:error, "Error returned from stream server (error 500)"]

        _resp ->
          #          Req.cancel_async_response(resp)
          [:error, "Undefined error"]
      end
    rescue
      e in Req.TransportError ->
        Logger.debug("Checking (request async) - (#{stream_url}) - rescue (req)")
        [:error, e.reason]

      e ->
        Logger.debug("Checking (request async) - (#{stream_url}) - rescue")
        [:error, e]
    catch
      :exit, _ ->
        Logger.debug("Checking (request async) - (#{stream_url}) - catch")
        [:error, nil]
    end
  end

  defp build_url(%Stream{} = _stream, "http" <> _url_rest = url) do
    url
  end

  defp build_url(%Stream{stream_url: base_url} = _stream = _args, url) do
    base_url
    |> String.trim_trailing("/")
    |> String.split("/")
    |> Enum.reverse()
    |> Enum.drop(1)
    |> Enum.reverse()
    |> Enum.join("/")
    |> then(&(&1 <> "/" <> String.trim_leading(url, "/")))
  end

  # maybe this could be done on another stage

  defp reset_errors(%Stream{} = stream) do
    Logger.debug("Resetting errors #{stream.id} (#{stream.stream_url})")

    # if https we reset errors, otherwise we mark it as working (checked)
    # this is so we identify working http streams that fails in an https website
    # then we can check if they have an updated https stream or assign it to the popup function
    changeset =
      case String.starts_with?(stream.stream_url, "http://") do
        true ->
          Stream.changeset_checked(stream, %{"checked" => true})

        false ->
          Stream.changeset_playing_error(stream, %{
            "playing_error" => 0,
            "playing_error_reason" => nil
          })
      end

    Repo.update!(changeset)
  end
end
