defmodule ProgRadioApi.SongProvider.Streamtheworld do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @impl true
  def has_custom_refresh(), do: true

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
          "https://np.tritondigital.com/public/nowplaying?mountName=#{id}&numberToFetch=1&eventType=track"
          |> SongProvider.get()
          |> Map.get(:body)
          |> XmlToMap.naive_map()
          |> Map.get("nowplaying-info-list", %{})
          |> Map.get("nowplaying-info")

          # TODO manage delta with cue_time_start and sicard if over?
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (streamtheworld): data error rescue")
        :error
    end
  end

  @impl true
  def get_song(name, data) do
    case data do
      nil ->
        Logger.info("Data provider - #{name} (streamtheworld): error fetching song data or empty")
        %{}

      _ ->
        %{
          artist: get_value(data, "track_artist_name"),
          title: get_value(data, "cue_title"),
          cover_url: get_value(data, "track_cover_url"),
        }
    end
  end

  defp get_value(data, key) do
    case Map.get(data, "#content", %{}) do
      nil -> nil
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
