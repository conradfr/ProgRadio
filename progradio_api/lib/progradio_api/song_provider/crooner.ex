defmodule ProgRadioApi.SongProvider.Crooner do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.croonerradio.fr/datas/live/titles.json"

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    try do
      id = SongProvider.get_stream_code_name_from_channel(name)

      @url
      |> SongProvider.get()
      |> Map.get(:body)
      |> :json.decode()
      |> Map.get(id, [])
      |> Enum.find(nil, fn e ->
        Map.get(e, "isCurrent") == true
      end)
    rescue
      _ -> :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      %{
        artist: Map.get(data, "subtitle"),
        title: Map.get(data, "title"),
        cover_url: Map.get(data, "cover_small")
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
