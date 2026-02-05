defmodule ProgRadioApi.SongProvider.GenericLoveradio do
  require Logger
  alias ProgRadioApi.SongProvider

  def has_custom_refresh(_name), do: true

  def get_refresh(_name, data, default_refresh) do
    case data do
      nil ->
        default_refresh

      _ ->
        try do
          now_unix = SongProvider.now_unix()

          {:ok, time_start, _} =
            data
            |> Map.get("airtime")
            |> DateTime.from_iso8601()

          duration = Map.get(data, "duration") |> String.to_integer()

          next_time =
            time_start
            |> DateTime.add(duration, :second)
            |> DateTime.to_unix()

          next = next_time - now_unix

          if now_unix + next < now_unix do
            default_refresh
          else
            next * 1000
          end
        rescue
          _ -> default_refresh
        end
    end
  end

  def get_data(code_name, id, url \\ nil) do
    start_url =
      if url != nil do
        url
      else
        "https://iris-#{code_name}.loverad.io"
      end

    try do
      "#{start_url}/flow.json?station=#{id}&offset=1&count=1&ts=#{SongProvider.now_unix()}"
      |> SongProvider.get()
      |> Map.get(:body)
      |> :json.decode()
      |> Map.get("result", %{})
      |> Map.get("entry", %{})
      |> List.first()
    rescue
      _ -> :error
    end
  end

  def get_song(name, data, _last_song) do
    try do
      case Map.get(data, "song", %{}) |> Map.get("entry", []) |> List.first() do
        nil ->
          %{}

        song_data ->
          artist =
            Map.get(song_data, "artist", %{})
            |> Map.get("entry", [])
            |> List.first(%{})
            |> Map.get("name")

          picture = Map.get(song_data, "cover_art_url_s")
          title = Map.get(song_data, "title")

          %{
            artist: artist,
            title: title,
            cover_url: picture
          }
      end
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
