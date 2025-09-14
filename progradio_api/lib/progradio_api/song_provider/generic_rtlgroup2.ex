defmodule ProgRadioApi.SongProvider.GenericRtlgroup2 do
  require Logger
  alias ProgRadioApi.SongProvider

  def get_refresh(_name, data, default_refresh) when is_map(data) do
    try do
      case (data["endDate"] - SongProvider.now_unix(:millisecond)) do
        seconds when seconds > 0 ->
          seconds + 500
        _ -> default_refresh
      end
    rescue
      _ -> default_refresh
    end
  end

  def get_refresh(_name, _data, default_refresh), do: default_refresh

  def get_data(id, _name, _last_data) do
    now_unix = SongProvider.now_unix(:millisecond)

    try do
      data =
        "https://www.rtl.fr/ws/live/#{id}/last-tracks"
        |> SongProvider.get()
        |> Map.get(:body)
        |> :json.decode()
        |> Enum.find(nil, fn e ->
          now_unix >= e["startDate"] and now_unix <= e["endDate"]
        end)
    rescue
      _ -> :error
    end
  end

  def get_song(name, data, _last_song) do
    try do
      %{
        artist: SongProvider.recase(data["artist"]),
        title: SongProvider.recase(data["title"])
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
