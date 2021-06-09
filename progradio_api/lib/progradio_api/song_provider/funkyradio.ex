defmodule ProgRadioApi.SongProvider.Funkyradio do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_referer %{
    "funkyradio_main" => "https://funkyradio.streamingmedia.it/play.mp3",
    "funkyradio_disco" => "https://discofunk.streamingmedia.it/play"
  }

  @url "https://funky.radio/wp-content/plugins/wp-lunaradio/js/stream-icy-meta.php"

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_auto_refresh(_name, _data, default_refresh), do: default_refresh

  @impl true
  def get_data(name, _last_data) do
    try do
      referer = @stream_referer[name]

      @url
      |> HTTPoison.post("{\"url\": \"#{referer}\"}", [])
      |> Map.get(:body)
    rescue
      _ -> nil
    end
  end

  @impl true
  def get_song(_name, :error), do: nil

  @impl true
  def get_song(name, data) do
    case data do
      nil ->
        Logger.info("Data provider - #{name}: error fetching song data or empty")
        %{}

      _ ->
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
    end
  end
end
