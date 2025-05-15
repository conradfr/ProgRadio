defmodule ProgRadioApi.SongProvider.GenericLesIndes do
  require Logger
  alias ProgRadioApi.SongProvider

  # 5mn
  @minutes_max 300

  def has_custom_refresh(), do: false

  def get_refresh(_name, _data, _default_refresh), do: nil

  def get_data(url, _name, last_data) do
    now_unix = SongProvider.now_unix()

    try do
      data =
        url
        |> SongProvider.get()
        |> Map.get(:body)
        |> :json.decode()
        |> convert_time_key()

      last_time =
        unless last_data == nil do
          Map.get(last_data, "time", now_unix)
        else
          now_unix
        end

      # These radios send the last artist-song played regardless if still playing
      # and we don't have the time start or end data.
      #
      # But the url sends the current timestamp, so we store it the earliest one we get for a song
      # and discard it if the same artist is returned for too long (meaning it's probably not playing anymore)

      if is_map(last_data) and Map.get(data, "artist") == Map.get(last_data, "artist") and
           last_time + @minutes_max < now_unix do
        nil
      else
        Map.replace(data, "time", last_time)
      end
    rescue
      _ -> :error
    end
  end

  def get_song(name, data, _last_song) do
    try do
      %{artist: SongProvider.recase(data["artist"]), title: SongProvider.recase(data["title"])}
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end

  defp convert_time_key(%{"mtime" => mtime} = data) do
    Map.put(data, "time", mtime)
  end

  defp convert_time_key(data), do: data
end
