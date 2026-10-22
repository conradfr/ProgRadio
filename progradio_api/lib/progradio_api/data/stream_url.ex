defmodule ProgRadioApi.Data.StreamUrl do
  require Logger

  def get(%{"type" => "location", "url" => url} = stream_data) when is_binary(url) do
    headers =
      case Map.get(stream_data, "referer") do
        referer when is_binary(referer) -> [referer: referer]
        _ -> []
      end

    # into: :self so a url answering with the audio stream itself doesn't download it forever
    case Req.get(url, headers: headers, redirect: false, retry: false, into: :self) do
      {:ok, %Req.Response{status: status} = response} ->
        Req.cancel_async_response(response)

        case Req.Response.get_header(response, "location") do
          [location | _] when status in 300..399 ->
            location

          _ ->
            Logger.warning("Stream url (location): no location header - #{status} - #{url}")
            nil
        end

      {:error, error} ->
        Logger.warning("Stream url (location): request error - #{url}", error: error)
        nil
    end
  end

  def get(_stream_data), do: nil
end
