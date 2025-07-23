defmodule ProgRadioApi.SongProvider.Icecast do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @refresh_auto_interval 10000

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_auto_refresh(), do: @refresh_auto_interval

  @impl true
  def get_data(name, _last_data) do
    url = SongProvider.get_stream_code_name_from_channel(name)

    try do
      {:ok, %Shoutcast.Meta{data: data, string: string}} =
        Shoutcast.read_meta(url, follow_redirect: true, pool: false)

      # the shoutcast library doesn't handle all weird icy metadata. If so we'll try to do it ourselves later
      cond do
        is_map(data) and map_size(data) > 0 -> data
        is_binary(string) and string != "" -> string
        true -> nil
      end
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
      case data do
        data when is_map(data) ->
          song_from_map(name, data)

        data when is_binary(data) ->
          parse_metadata_string(name, data)

        _ ->
          nil
      end
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end

  defp song_from_map(name, data) do
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

    Logger.debug("Data provider - #{name} (icecast): data (map) - #{song}")

    # we discard empty or suspicious/incomplete entries
    if is_binary(song) and song != "" and song != "-" and
         String.contains?(song, " - ") === true do
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

      %{
        artist: song,
        title: nil,
        cover_url: cover_art
      }
    else
      %{}
    end
  end

  defp parse_metadata_string(name, data) do
    regex = ~r/StreamTitle='(?<artist>.*?) - .*?text="(?<title>.*?)" song_spot/

    case Regex.named_captures(regex, data) do
      %{"artist" => artist, "title" => title} ->
        Logger.debug("Data provider - #{name} (icecast): data (string) - #{artist} - #{title}")

        %{
          artist: artist,
          title: title,
          cover_url: extract_cover_from_metadata(data)
        }

      nil ->
        nil
    end
  end

  defp extract_cover_from_metadata(data) do
    regex = ~r/amgArtworkURL="(?<artwork_url>http[^"]*)/

    case Regex.named_captures(regex, data) do
      %{"artwork_url" => url} -> url
      nil -> nil
    end
  end
end
