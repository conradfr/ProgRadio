defmodule ProgRadioApi.SongProvider.Radio0n do
  require Logger
  alias ProgRadioApi.SongProvider

  # adapted from asura_hosting.ex

  @behaviour ProgRadioApi.SongProvider

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    Logger.debug("Data provider - #{name} (0n): data")

    pattern = ~r/https:\/\/([^.]+)\.radionetz/
    [_, extracted_part] = Regex.run(pattern, name)

    try do
      "https://www.0nradio.com/now_playing.php?station_url=https://www.0nradio.com/now_playing/#{extracted_part}.json&_=#{SongProvider.now_unix()}"
      |> SongProvider.get()
      |> Map.get(:body)
      |> :json.decode()
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (0n): data error rescue")
        :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      Logger.debug("Data provider - #{name} (0n): song")

      case data do
        nil ->
          nil

        :error ->
          nil

        _ ->
          %{
            artist: Map.get(data, "track"),
            title: nil,
            cover_url: nil
          }
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (0n): song error rescue")
        :error
    end
  end
end
