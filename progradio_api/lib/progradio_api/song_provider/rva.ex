defmodule ProgRadioApi.SongProvider.Rva do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "rva_ambert" => "16",
    "rva_riommontagnes" => "17",
    "rva_clermont" => "14",
    "rva_thiers" => "19",
    "rva_riom" => "13",
    "rva_issoire" => "20",
    "rva_gannat" => "17",
    "rva_vichy" => "15",
    "rva_brioude" => "18",
    "rva_dance90" => "24",
    "rva_annees80" => "10",
    "rva_annees90" => "8",
    "rva_annees2000" => "11",
    "rva_annees2010" => "12",
    "rva_rock" => "22",
    "rva_latino" => "23"
  }

  @url "https://www.radiorva.com/lite/update_onair"

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data, _db_song_data) do
    try do
      id =
        name
        |> SongProvider.get_stream_code_name_from_channel()
        |> SongProvider.get_id_from_list(@stream_ids)

      @url
      |> Req.post!(
        headers: [
          {"Cache-Control", "no-cache"}
        ],
        json: %{
          radio_ids: [id]
        },
        redirect: false,
        connect_options: [timeout: 15_000]
      )
      |> Map.get(:body)
      |> Map.get(id, nil)
    rescue
      _ -> :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      %{
        artist: Map.get(data, "artist"),
        title: Map.get(data, "title"),
        cover_url: Map.get(data, "cover")
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
