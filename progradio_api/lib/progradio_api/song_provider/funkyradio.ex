defmodule ProgRadioApi.SongProvider.Funkyradio do
  require Logger
  alias ProgRadioApi.SongProvider

  # deprecated as icecast works for it now
  # kept for reference

  @behaviour ProgRadioApi.SongProvider

  @stream_referer %{
    "funkyradio_main" => "https://funkyradio.streamingmedia.it/play.mp3",
    "funkyradio_disco" => "https://discofunk.streamingmedia.it/play"
  }

  @url "https://funky.radio/wp-content/plugins/lu-radioplayer/js/stream-icy-meta.php"

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    try do
      channel = SongProvider.get_stream_code_name_from_channel(name)
      referer = @stream_referer[channel]
      body_post = URI.encode_query(%{"url" => referer})

      case HTTPoison.post(@url, body_post, %{
             "Content-Type" => "application/x-www-form-urlencoded",
             "Cache-Control" => "no-cache"
           }) do
        {:ok, %HTTPoison.Response{body: body}} ->
          body

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
      Logger.debug("Data provider - #{name}: data - #{data}")

      # we discard empty or suspicious/incomplete entries
      unless data === "" or String.contains?(data, " - ") === false do
        %{
          artist: data,
          title: nil
        }
      else
        %{}
      end
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
