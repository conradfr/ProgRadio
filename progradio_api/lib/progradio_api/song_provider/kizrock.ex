defmodule ProgRadioApi.SongProvider.Kizrock do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "kizrock_metal" => "https://www.kaleidoscopiccreation.mobi/kizrock/song_history_metal.json",
    "kizrock_rock" => "https://www.kaleidoscopiccreation.mobi/kizrock/song_history_kizrock.json"
  }

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    now_unix = SongProvider.now_unix()

    url =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()

    try do
      "#{url}?_=#{now_unix}"
      |> SongProvider.get()
      |> Map.get(:body)
      |> Jason.decode!()
      |> List.first()
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
        artist = Map.get(data, "artist")
        picture = Map.get(data, "coverart")
        title = Map.get(data, "title")

        title =
          case Map.get(data, "year") do
            nil -> title
            year -> "#{title} (#{year})"
          end

        %{
          artist: artist,
          title: title,
          cover_url: picture
        }
    end
  end
end
