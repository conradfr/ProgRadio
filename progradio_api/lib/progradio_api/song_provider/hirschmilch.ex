defmodule ProgRadioApi.SongProvider.Hirschmilch do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @url "https://hirschmilch.de/channel/tunein/"

  @stream_ids %{
    "hirschmilch_chillout" => "chillout",
    "hirschmilch_electronic" => "electronic",
    "hirschmilch_hypnotic" => "hypnotic",
    "hirschmilch_organichouse" => "organic-house",
    "hirschmilch_proghouse" => "prog-house",
    "hirschmilch_progressive" => "progressive",
    "hirschmilch_psytrance" => "psytrance",
    "hirschmilch_techno" => "techno"
  }

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, default_refresh), do: default_refresh

  @impl true
  def get_data(name, _last_data) do
    try do
      id =
        name
        |> SongProvider.get_stream_code_name_from_channel()
        |> SongProvider.get_id_from_list(@stream_ids)

      SongProvider.get_json(@url <> id)
    rescue
      _ -> :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      cover_url = Map.get(data, "image")

      cover_url =
        if !is_nil(cover_url) do
          "https://hirschmilch.de" <> cover_url
        else
          nil
        end

      %{
        artist: Map.get(data, "metaartist"),
        title: Map.get(data, "metatitle"),
        cover_url: cover_url
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
