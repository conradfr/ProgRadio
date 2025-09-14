defmodule ProgRadioApi.SongProvider.Streamtheworld do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @seconds_max_delta 600

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    try do
      regex = ~r/api\/livestream-redirect\/([a-zA-Z0-9_]+)(?:\.)?/

      [_, id] = Regex.run(regex, name)

      case id do
        nil ->
          nil

        _ ->
          data =
            "https://np.tritondigital.com/public/nowplaying?mountName=#{id}&numberToFetch=1&eventType=track"
            |> SongProvider.get()
            |> Map.get(:body)
            |> XmlToMap.naive_map()
            |> Map.get("nowplaying-info-list", %{})
            |> Map.get("nowplaying-info")

          # discard if over
          case get_value(data, "cue_time_start") do
            nil ->
              data

            time_start ->
              if String.to_integer(time_start) / 1000 + @seconds_max_delta <
                   SongProvider.now_unix() do
                nil
              else
                data
              end
          end
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (streamtheworld): data error rescue")
        :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      %{
        artist: get_value(data, "track_artist_name"),
        title: get_value(data, "cue_title"),
        cover_url: get_value(data, "track_cover_url")
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end

  defp get_value(data, key) do
    case Map.get(data, "#content", %{}) do
      nil ->
        nil

      content ->
        content
        |> Map.get("property", [])
        |> Enum.find(%{}, fn
          value when is_map(value) -> Map.get(value, "-name") == key
          _ -> false
        end)
        |> Map.get("#content")
    end
  end
end
