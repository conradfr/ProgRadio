defmodule ProgRadioApi.SongProvider.GenericRtlgroup do
  require Logger
  alias ProgRadioApi.SongProvider

  @date_format "{0D}-{0M}-{YYYY}"
  @minutes_max_delta 4

  def has_custom_refresh(), do: false

  def get_refresh(_name, _data, _default_refresh), do: nil

  def get_data(url) do
    date_string =
      Timex.now()
      |> Timex.format!(@date_format)

    # /songs?hour=19&minute=6
    try do
      (url <> date_string)
      |> SongProvider.get()
      |> Map.get(:body)
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
        Logger.debug("Data provider - #{name}: parsing data")

        try do
          content =
            data
            |> Floki.parse_document!()
            |> Floki.find(".cards-container > .card-qect")
            |> List.first()

          case content do
            nil ->
              %{}

            _ ->
              within_time =
                content
                |> Floki.attribute("data-time")
                |> List.first()
                |> inside_current_timeframe?(@minutes_max_delta)

              if within_time == true do
                artist =
                  content
                  |> Floki.find("div.hosts")
                  |> Floki.text()

                title =
                  content
                  |> Floki.find("div.title")
                  |> Floki.text()

                %{
                  artist: SongProvider.recase(artist) || nil,
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
    current_time = DateTime.now!("Europe/Paris")
    time_with_delta = DateTime.add(datetime, max_delay * 60, :second)

    DateTime.compare(current_time, datetime) != :lt and
      DateTime.compare(current_time, time_with_delta) == :lt
  end

  defp inside_current_timeframe?(_time, _max_delay), do: false

  defp get_song_datetime(time_string) when is_binary(time_string) do
    [hours, minutes] = String.split(time_string, "h")
    {hour, ""} = Integer.parse(hours)
    {minute, ""} = Integer.parse(minutes)

    time = Time.new!(hour, minute, 0)

    current_date =
      "Europe/Paris"
      |> DateTime.now!()
      |> DateTime.to_date()

    DateTime.new!(
      current_date,
      time,
      "Europe/Paris"
    )
  end
end