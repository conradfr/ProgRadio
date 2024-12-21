defmodule ProgRadioApi.SongProvider.GenericRts do
  require Logger
  alias ProgRadioApi.SongProvider

  def has_custom_refresh(), do: false

  def get_refresh(_name, _data, _default_refresh), do: nil

  def get_data(url, _name, _last_data) do
    try do
      url
      |> SongProvider.get()
      |> Map.get(:body)
    rescue
      _ -> nil
    end
  end

  def get_song(max_delay, name, data) do
    case data do
      nil ->
        Logger.info("Data provider - #{name}: error fetching song data or empty")
        %{}

      _ ->
        Logger.debug("Data provider - #{name}: parsing data")

        try do
          content =
            data
            |> Floki.parse_document!()
            |> Floki.find(".song-items > .song-item")
            |> List.first()

          case content do
            nil ->
              %{}

            _ ->
              within_time =
                content
                |> Floki.find(".song-info time")
                |> Floki.text()
                |> inside_current_timeframe?(max_delay)

              if within_time == true do
                artist =
                  content
                  |> Floki.find(".song-info p.artist")
                  |> Floki.text()

                title =
                  content
                  |> Floki.find(".song-info h3.title")
                  |> Floki.text()

                %{
                  artist: artist || nil,
                  title: title || nil
                }
              else
                %{}
              end
          end
        rescue
          _ -> %{}
        end
    end
  end

  defp inside_current_timeframe?(time, max_delay) when is_binary(time) do
    datetime = get_song_datetime(time)
    current_time = DateTime.now!("Europe/Zurich")
    time_with_delta = DateTime.add(datetime, max_delay * 60, :second)

    DateTime.compare(current_time, datetime) != :lt and
      DateTime.compare(current_time, time_with_delta) == :lt
  end

  defp inside_current_timeframe?(_time, _max_delay), do: false

  defp get_song_datetime(time_string) when is_binary(time_string) do
    [hours, minutes] = String.split(time_string, ":")
    {hour, ""} = Integer.parse(hours)
    {minute, ""} = Integer.parse(minutes)

    time = Time.new!(hour, minute, 0)

    current_date =
      "Europe/Zurich"
      |> DateTime.now!()
      |> DateTime.to_date()

    DateTime.new!(
      current_date,
      time,
      "Europe/Zurich"
    )
  end
end
