defmodule ProgRadioApi.SongProvider.RadioGoodlife do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  # 5mn
  @max_length_seconds 300

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(_name, _last_data) do
    now_unix = SongProvider.now_unix()

    try do
      "https://generationdiscofunk.com/playingnow.xml?t=#{now_unix}"
      |> SongProvider.get()
      |> XmlToMap.naive_map()
      |> Map.get("NowPlaying", %{})
      |> Map.get("Current", nil)
    rescue
      _ -> :error
    catch
      :error, _reason ->
        :error

      :exit, _ ->
        [:error, nil]
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      %{
        artist: SongProvider.recase(data["Artist"]) || nil,
        title: SongProvider.recase(data["Title"]) || nil,
        cover_url:
          case data["Image"] do
            "https://www.generationdiscofunk.com/covers/_no_image.png" -> nil
            image -> image
          end
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
