defmodule ProgRadioApi.SongProvider.Forever do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @minutes_max_delta 300

  @stream_ids %{
    "forever_main" => "101662121556343301",
    "forever_libourne" => "101662121556343301",
    "forever_arcachon" => "101662121556343301",
  }

  @impl true
  def has_custom_refresh(), do: true

  @impl true
  def get_refresh(_name, nil, default_refresh), do: default_refresh

  @impl true
  def get_refresh(_name, data, default_refresh) do
    now_unix = SongProvider.now_unix()

    end_unix =
      data
      |> Map.get("end_timestamp", now_unix)
      |> Kernel.trunc()

    case end_unix - now_unix do
      next_refresh when next_refresh > 0 -> next_refresh * 1000
      _ -> default_refresh
    end
  end

  @impl true
  def get_data(name, _last_data) do
    now_unix = SongProvider.now_unix()
    id =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()

    url = "https://www.foreverlaradio.fr/api/TitleDiffusions?size=4&radioStreamId=#{id}8&date=#{now_unix}000"

    try do
      url
      |> SongProvider.get()
      |> Map.get(:body)
      |> Jason.decode!()
#      |> Enum.sort(fn first, last ->
#        {:ok, first_date, _} =
#          first
#          |> Map.get("timestamp")
#          |> DateTime.from_iso8601()
#
#        {:ok, last_date, _} =
#          last
#          |> Map.get("timestamp")
#          |> DateTime.from_iso8601()
#
#        DateTime.to_unix(last_date) >= DateTime.to_unix(first_date)
#      end)
      |> Enum.find(nil, fn item ->
        {:ok, item_start, _} =
           item
           |> Map.get("timestamp")
           |> DateTime.from_iso8601()

        (DateTime.to_unix(item_start) + @minutes_max_delta) > now_unix
      end)
    rescue
      _ -> nil
    end
  end

  @impl true
  def get_song(name, data) do
    case data do
      nil ->
        Logger.info("Data provider - #{name}: error fetching song data or empty")
        %{}

      _ ->
        %{
          artist: SongProvider.recase(data["title"]["artist"] || nil),
          title: SongProvider.recase(data["title"]["title"] || nil)
        }
    end
  end
end
