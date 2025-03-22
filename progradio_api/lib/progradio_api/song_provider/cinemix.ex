defmodule ProgRadioApi.SongProvider.Cinemix do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @url "https://vhost.fastserv.com/~cinemix/samPHPwebVIP/web/playing.php?buster="

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(_name, _last_data) do
    buster =
      Enum.random(0..10000)
      |> Integer.to_string()

    try do
      (@url <> buster)
      |> SongProvider.get()
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
        Logger.debug("Data provider - #{name}: parsing data")

        {:ok, html} = Floki.parse_document(data)

        title =
          try do
            html
            |> Floki.find("#currently_playing_wrapper #currently-playing-title")
            |> Floki.text()
            |> String.trim()
            |> tap(fn e ->
              if e === "", do: nil, else: e
            end)
          rescue
            _ -> nil
          end

        artist =
          try do
            html
            |> Floki.find("#currently_playing_wrapper #currently-playing-artist")
            |> Floki.text()
            |> String.trim()
            |> tap(fn e ->
              if e === "", do: nil, else: e
            end)
          rescue
            _ -> nil
          end

        cover =
          try do
            html
            |> Floki.find("#cpPictureMainSong")
            |> Floki.text()
            |> String.trim()
            |> tap(fn e ->
              if e === "", do: nil, else: e
            end)
          rescue
            _ -> nil
          end

        unless artist === nil and title === nil do
          %{
            artist: artist,
            title: title,
            cover_url: cover
          }
        else
          %{}
        end
    end
  end
end
