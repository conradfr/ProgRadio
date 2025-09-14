defmodule ProgRadioApi.SongProvider.Bideetmusique do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.bide-et-musique.com/radio-info.php"

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(_name, _last_data) do
    try do
      @url
      |> SongProvider.get()
      |> Map.get(:body)
    rescue
      _ -> :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
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
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
