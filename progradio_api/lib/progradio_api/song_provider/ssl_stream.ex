defmodule ProgRadioApi.SongProvider.SslStream do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    now_unix = SongProvider.now_unix()
    url = String.split(name, ":", parts: 2) |> List.last()

    try do
      "https://ssl-stream.com/portal/icecast_now_playing.php/?url=#{url}?nocache=#{now_unix}"
      |> SongProvider.get()
      |> Map.get(:body)
    rescue
      _ ->
        Logger.error("Data provider - (ssl-stream) #{name}: data error rescue")
        :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      unless data == nil or data == :error do
        %{
          artist: data,
          title: nil
        }
      else
        %{}
      end
    rescue
      _ ->
        Logger.error("Data provider - (ssl-stream) #{name}: song error rescue")
        :error
    end
  end
end
