defmodule ProgRadioApi.SongProvider.BelRtl do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "bel_rtl_main" => 6,
    "bel_rtl_comedy" => 1146,
    "bel_rtl_chanson_francaise" => 120,
    "bel_rtl_80" => 1143,
    "bel_rtl_musique" => 1141,
    "bel_rtl_60" => 1144,
    "bel_rtl_90" => 1145,
    "bel_rtl_happy" => 1142
  }

  @impl true
  def has_custom_refresh(_name), do: true

  @impl true
  def get_refresh(_name, nil, default_refresh), do: default_refresh

  @impl true
  def get_refresh(_name, data, default_refresh) do
    try do
      now_unix = SongProvider.now_unix()

      end_unix =
        data
        |> Map.get("now", %{})
        |> Map.get("stopTime", 0)
        |> String.to_integer()

      case end_unix - now_unix do
        next_refresh when next_refresh > 0 -> next_refresh * 1000
        _ -> default_refresh
      end
    rescue
      _ -> default_refresh
    end
  end

  @impl true
  def get_data(name, _last_data) do
    id =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()

    url = "https://core-search.radioplayer.cloud/056/qp/v4/events/?rpId=#{id}"

    try do
      url
      |> SongProvider.get()
      |> Map.get(:body)
      |> :json.decode()
      |> Map.get("results", %{})
      |> Map.get("now")
    rescue
      _ ->
        nil
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      artist = Map.get(data, "artistName")
      title = Map.get(data, "name")
      picture = Map.get(data, "imageUrl")

      if artist != nil or title != nil do
        %{
          artist: artist,
          title: title,
          cover_url: picture
        }
      else
        nil
      end
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
