defmodule ProgRadioApi.SongProvider.Radiochablais do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "radiochablais_main" => 1,
    "radiochablais_swissmade" => 16
  }

  @url "https://radiochablais.ch/player/getdataplayer.php?id_radio="

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    id =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()
      |> Integer.to_string()

    try do
      (@url <> id)
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
            |> Floki.find("#webradioTitle")
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
            |> Floki.find("#webradioArtist")
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
            artist: SongProvider.recase(artist),
            title: SongProvider.recase(title)
          }
        else
          %{}
        end
    end
  end
end
