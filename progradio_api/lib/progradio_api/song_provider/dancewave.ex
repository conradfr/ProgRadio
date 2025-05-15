defmodule ProgRadioApi.SongProvider.Dancewave do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "dancewave_main" => {"dw", "https://dancewave.online/tracklist/"},
    "dancewave_retro" => {"dwr", "https://dancewave.online/tracklist-retro/"}
  }

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    try do
      now_unix = SongProvider.now_unix()

      {id, referer} =
        SongProvider.get_stream_code_name_from_channel(name)
        |> (&Map.get(@stream_ids, &1)).()

      url =
        "https://dancewave.online/api/playlist.cgi?user=dw8080&streamid=1&mount=/#{id}.ogg&num=1&excludestring=Dance%20Wave&out=json&_=#{now_unix}"

      case HTTPoison.get(url, %{
             "Host" => "dancewave.online",
             "Referer" => referer,
             #             "Content-Type" => "application/json",
             "Cache-Control" => "no-cache",
             "Pragma" => "no-cache"
           }) do
        {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
          current_song =
            Enum.join(for <<c::utf8 <- body>>, do: <<c::utf8>>)
            |> Jason.decode!()
            |> Map.get("mscp", %{})
            |> Map.get("playlist", [])
            |> List.first()

          case current_song do
            nil ->
              nil

            _ ->
              # we should check the time diff with some threshold but they don't it in their own code
              # todo maybe later
              current_song
          end

        _ ->
          nil
      end
    rescue
      _ -> :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      %{artist: Map.get(data, "artist"), title: Map.get(data, "title")}
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
