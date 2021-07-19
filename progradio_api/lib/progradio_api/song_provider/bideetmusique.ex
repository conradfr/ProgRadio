defmodule ProgRadioApi.SongProvider.Bideetmusique do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.bide-et-musique.com/radio-info.php"

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_auto_refresh(_name, _data, default_refresh), do: default_refresh

  @impl true
  def get_data(_name, _last_data) do
    try do
      @url
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
            |> Floki.find(".titre-song > a")
            |> Floki.text()
            |> :unicode.characters_to_binary(:latin1)
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
            |> Floki.find(".titre-song2 > a")
            |> Floki.text()
            |> :unicode.characters_to_binary(:latin1)
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
            title: title
          }
        else
          %{}
        end
    end
  end
end
