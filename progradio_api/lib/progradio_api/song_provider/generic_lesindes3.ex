defmodule ProgRadioApi.SongProvider.GenericLesIndes3 do
  require Logger
  alias ProgRadioApi.SongProvider

  # 5mn
  @minutes_max 300

  def has_custom_refresh(), do: false

  def get_refresh(_name, _data, _default_refresh), do: nil

  def get_data(url, name, %{} = radio_id) do
    radio_id =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(radio_id, &1)).()

    get_data(url, name, radio_id)
  end

  def get_data(url, _name, radio_id) when is_binary(radio_id) do
    now_unix = SongProvider.now_unix()
    full_url = "#{url}?size=6&radioStreamId=#{radio_id}&date=#{now_unix}000"

    try do
      full_url
      |> SongProvider.get()
      |> Map.get(:body)
      |> Jason.decode!()
      |> Enum.find(nil, fn e ->
        try do
          {:ok, time_start, _} =
            e
            |> Map.get("timestamp")
            |> DateTime.from_iso8601()

          time_start_iso = DateTime.to_unix(time_start)

          # We don't have the end time so we put a time limit to check against
          time_end = time_start_iso + @minutes_max
          now_unix >= time_start_iso and now_unix <= time_end
        rescue
          _ -> false
        end
      end)
    rescue
      _ -> nil
    end
  end

  def get_song(name, data) do
    case data do
      nil ->
        Logger.info("Data provider - #{name}: error fetching song data or empty")
        %{}

      _ ->
        %{
          artist: SongProvider.recase(data["title"]["artist"] || nil),
          title: SongProvider.recase(data["title"]["title"] || nil),
          cover_url: data["title"]["coverUrl"] || nil
        }
    end
  end
end
