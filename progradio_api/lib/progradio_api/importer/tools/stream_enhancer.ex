defmodule ProgRadioApi.Importer.StreamEnhancer do
  @moduledoc """
  Adds data to a stream, or to the map of a stream returned by the format function of an importer.

  Only the missing data is fetched: an import does not fetch it again for the streams that already have it.

    * amperwave: the `mobileId` of the station, found on its website (in its json config,
      `"mobileId":"5066"`), as `"amperwave_mobile_id"` in the song data. Only the townsquare
      stations (`.amperwave.net/.../townsquare-{station}...` streams) have one
  """

  require Logger
  alias ProgRadioApi.Stream
  alias ProgRadioApi.TaskSupervisor
  alias ProgRadioApi.Utils.ReqUtils

  @timeout 10_000

  # a website request can be connect + receive timeouts, and redirects
  @task_timeout 30_000
  @max_concurrency 10

  # some websites refuse the default user agent of Req
  @user_agent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"

  # quotes can be escaped when the json is in a string ("mobileId\":\"5066\")
  @mobile_id_regex ~r/\\?"mobileId\\?"\s*:\s*\\?"?(\d+)/

  # the websites are fetched concurrently, the streams are kept in order
  # a stream that takes too long or crashes is returned as is (not linked: a crash does not reach the caller)
  def enhance(streams) when is_list(streams) do
    TaskSupervisor
    |> Task.Supervisor.async_stream_nolink(streams, &enhance/1,
      max_concurrency: @max_concurrency,
      timeout: @task_timeout,
      on_timeout: :kill_task
    )
    |> Enum.zip_with(streams, fn
      {:ok, enhanced_stream}, _stream -> enhanced_stream
      {:exit, _reason}, stream -> stream
    end)
  end

  def enhance(%Stream{} = stream), do: enhance_song_data(stream)

  def enhance(%{} = stream), do: enhance_song_data(stream)

  # song_data is a json column: its keys are strings once read from the database, so are ours
  defp enhance_song_data(stream) do
    song_data = Map.get(stream, :song_data) || %{}

    case amperwave(stream, song_data) do
      ^song_data -> stream
      updated_song_data -> Map.put(stream, :song_data, updated_song_data)
    end
  end

  # ----- amperwave -----

  defp amperwave(%{stream_url: stream_url, website: website}, song_data)
       when is_binary(stream_url) and is_binary(website) and website != "" do
    if String.contains?(stream_url, "amperwave.net") and
         String.contains?(stream_url, "/townsquare-") and
         not is_map_key(song_data, "amperwave_mobile_id") do
      case get_mobile_id(website) do
        nil -> song_data
        mobile_id -> Map.put(song_data, "amperwave_mobile_id", mobile_id)
      end
    else
      song_data
    end
  end

  defp amperwave(_stream, song_data), do: song_data

  defp get_mobile_id(website) do
    with {:ok, body} <- get_website(website),
         [_, mobile_id] <- Regex.run(@mobile_id_regex, body) do
      mobile_id
    else
      _ -> nil
    end
  end

  # ----- utils -----

  defp get_website(website) do
    url = if String.match?(website, ~r/^https?:\/\//i), do: website, else: "http://" <> website

    options = [
      headers: [{"User-Agent", @user_agent}],
      retry: false,
      decode_body: false,
      receive_timeout: @timeout
    ]

    try do
      url
      |> Req.get(ReqUtils.get_options_for(url, [connect_options: [timeout: @timeout]] ++ options))
      |> get_body(url)
    rescue
      # invalid url
      e ->
        Logger.debug("Enhancer - #{url}: website error #{inspect(e)}")
        :error
    catch
      # https url redirected to http: the tls options can't open the http connection, Finch exits
      # Req default options (certificate verified) work for both
      :exit, :badarg ->
        try do
          url
          |> Req.get(
            [redirect: true, max_redirects: 5, connect_options: [timeout: @timeout]] ++ options
          )
          |> get_body(url)
        rescue
          _ -> :error
        catch
          :exit, _ -> :error
        end

      :exit, reason ->
        Logger.debug("Enhancer - #{url}: website exit #{inspect(reason)}")
        :error
    end
  end

  defp get_body({:ok, %Req.Response{status: 200, body: body}}, _url) when is_binary(body),
    do: {:ok, body}

  defp get_body(response, url) do
    Logger.debug("Enhancer - #{url}: website error #{inspect(response)}")
    :error
  end
end
