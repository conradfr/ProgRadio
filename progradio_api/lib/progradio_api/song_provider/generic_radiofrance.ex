defmodule ProgRadioApi.SongProvider.GenericRadioFrance do
  require Logger
  alias ProgRadioApi.SongProvider

  def has_custom_refresh(_name), do: true

  def get_refresh(_name, nil, _default_refresh), do: nil

  def get_refresh(_name, data, default_refresh) do
    now_unix = SongProvider.now_unix()
    end_unix = (Map.get(data, "endTime", default_refresh) || default_refresh) + 5

    case end_unix - now_unix do
      next_refresh when next_refresh > 0 -> next_refresh * 1000
      _ -> default_refresh
    end
  end

  def get_data(url, name, _last_data) do
    try do
      url
      |> SongProvider.get()
      |> JSON.decode!()
      |> Map.get("now")
    rescue
      _ ->
        Logger.error("Data provider - #{name}: data error rescue")
        :error
    end
  end

  def get_song(name, data, _last_song) do
    try do
      fallback =
        data
        |> Map.get("firstLine", nil)

      artist =
        data
        |> Map.get("secondLine", fallback)

      picture_id =
        data
        |> Map.get("cover")

      picture =
        case picture_id do
          nil -> nil
          _ -> "https://www.radiofrance.fr/pikapi/images/#{picture_id}/200x200"
        end

      %{
        artist: artist,
        title: nil,
        cover_url: picture
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
