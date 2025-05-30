defmodule ProgRadioApi.SongProvider.Icecast do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @refresh_auto_interval 10000

  #  @icecast_api "/status-json.xsl"

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_auto_refresh(), do: @refresh_auto_interval

  @impl true
  def get_data(name, _last_data) do
    url = SongProvider.get_stream_code_name_from_channel(name)

    #    data =
    #      case is_map(last_data) do
    #        true when is_map_key(last_data, :json) == true and last_data.json === true ->
    #          get_json_data(url)
    #
    #        true ->
    #          nil
    #
    #        _ ->
    #          get_json_data(url)
    #      end
    #
    #    case data do
    #      %{} ->
    #        Map.put(data, :json, true)
    #
    #      _ ->
    try do
      {:ok, %Shoutcast.Meta{data: data}} =
        Shoutcast.read_meta(url, follow_redirect: true, pool: false)

      data
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (icecast): data error rescue")
        :error
    catch
      :exit, _ ->
        Logger.debug("Data provider - #{name} (icecast): data error catch")
        :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      key =
        if is_map_key(data, :json) and data.json == true, do: "title", else: "StreamTitle"

      song =
        data
        |> Map.get(key, "")
        |> then(fn
          text when is_binary(text) ->
            Enum.join(for <<c::utf8 <- text>>, do: <<c::utf8>>)

          text when is_list(text) ->
            to_string(text)

          text ->
            text
        end)
        |> String.trim()

      Logger.debug("Data provider - #{name} (icecast): data - #{song}")

      cover_art =
        data
        |> Map.get("StreamUrl", "")
        |> then(fn
          text when is_binary(text) ->
            Enum.join(for <<c::utf8 <- text>>, do: <<c::utf8>>)

          text when is_list(text) ->
            to_string(text)

          text ->
            text
        end)
        |> String.trim()
        |> then(fn x ->
          case String.ends_with?(x, [".jpg", ".png"]) do
            true -> x
            _ -> nil
          end
        end)

      # we discard empty or suspicious/incomplete entries
      unless is_binary(song) == false or song === "" or song === "-" or
               String.contains?(song, " - ") === false do
        %{
          artist: song,
          title: nil,
          cover_url: cover_art
        }
      else
        %{}
      end
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end

  #  defp get_json_data(stream_url) do
  #    parsed_url = URI.parse(stream_url)
  #
  #    base_url =
  #      "#{parsed_url.scheme}://#{parsed_url.host}#{if parsed_url.port, do: ":#{parsed_url.port}", else: ""}"
  #
  #    try do
  #      "#{base_url}#{@icecast_api}"
  #      |> SongProvider.get()
  #      |> Map.get(:body)
  #      |> :json.decode()
  #      |> Map.get("icestats")
  #      |> Map.get("source")
  #      |> Enum.find(fn s ->
  #        String.contains?(s["listenurl"], parsed_url.host) == true and
  #          String.contains?(s["listenurl"], parsed_url.path || "") == true
  #      end)
  #    rescue
  #      _ -> nil
  #    end
  #  end
end
