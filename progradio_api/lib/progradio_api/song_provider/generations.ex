defmodule ProgRadioApi.SongProvider.Generations do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @url "https://generations.fr/winradio/prog.xml"
#  @radio_lag 10
  # 5mn
  @max_length_seconds 300

  @impl true
  def has_custom_refresh(), do: true

  @impl true
  def get_auto_refresh(_name, _data, default_refresh), do: default_refresh

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

#  @impl true
#  def get_refresh(_name, nil, _default_refresh), do: @radio_lag * 1000
#
#  @impl true
#  def get_refresh(_name, data, default_refresh) do
#    try do
#      now_unix = SongProvider.now_unix()
#
#      time_start =
#        data
#        |> Map.get("#content", %{})
#        |> Map.get("date_prog")
#        |> NaiveDateTime.from_iso8601!()
#        |> DateTime.from_naive!("Europe/Paris")
#        |> DateTime.to_unix()
#
#      {duration, _} =
#        data
#        |> Map.get("#content", %{})
#        |> Map.get("duration")
#        |> Time.from_iso8601!()
#        |> Time.to_seconds_after_midnight()
#
#      next = time_start + duration + @radio_lag - now_unix
#
#      if time_start + next < now_unix do
#        @radio_lag * 1000
#      else
#        next * 1000
#      end
#    rescue
#      _ -> default_refresh
#    end
#  end

  @impl true
  def get_data(_name, _last_data) do
    now_unix = SongProvider.now_unix()

    @url
    |> SongProvider.get()
    |> Map.get(:body)
    |> XmlToMap.naive_map()
    |> Map.get("prog", %{})
    |> Map.get("morceau", [])
    |> Enum.find(nil, fn e ->
      try do
        time_start =
          e
          |> Map.get("#content", %{})
          |> Map.get("date_prog")
          |> NaiveDateTime.from_iso8601!()
          |> DateTime.from_naive!("Europe/Paris")
          |> DateTime.to_unix()

#        {duration, _} =
#          e
#          |> Map.get("#content", %{})
#          |> Map.get("duration")
#          |> Time.from_iso8601!()
#          |> Time.to_seconds_after_midnight()
#
#        time_end = time_start + duration
        time_end = time_start + @max_length_seconds
        now_unix >= time_start and now_unix <= time_end
      rescue
        _ -> nil
      end
    end)
  end

  @impl true
  def get_song(name, data) do
    case data do
      nil ->
        Logger.info("Data provider - #{name}: error fetching song data or empty")
        %{}

      _ ->
        %{
          artist: SongProvider.recase(data["#content"]["chanteur"]),
          title: SongProvider.recase(data["#content"]["chanson"])
        }
    end
  end
end
