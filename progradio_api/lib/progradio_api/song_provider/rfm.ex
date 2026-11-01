defmodule ProgRadioApi.SongProvider.Rfm do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "rfm_main" => "1",
    "rfm_celine" => "97",
    "rfm_party80" => "100",
    "rfm_muller" => "55",
    "rfm_night_fever" => "7",
    "rfm_top50" => "22",
    "rfm_new_wave" => "37",
    "rfm_poprock" => "31",
    "rfm_funk" => "82",
    "rfm_disco" => "91",
    "rfm_francais" => "34",
    "rfm_italie" => "76",
    "rfm_california" => "52",
    "rfm_ontheroad" => "79",
    "rfm_cinema" => "58",
    "rfm_collector" => "4",
    "rfm_slow" => "40",
    "rfm_lounge" => "16",
    "rfm_love_songs" => "28",
    "rfm_chagrins" => "46",
    "rfm_70s" => "49",
    "rfm_80s" => "13",
    "rfm_party8090" => "43",
    "rfm_party90" => "19",
    "rfm_2000" => "61",
    "rfm_2010" => "64",
    "rfm_live" => "67",
    "rfm_run_fit" => "85",
    "rfm_summer" => "25",
    "rfm_couleur" => "10"
  }

  @url "https://www.rfm.fr/cache/titrage/"

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

      (@url <> id)
      |> SongProvider.get_json()
    rescue
      _ -> :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      %{
        artist: SongProvider.recase(Map.get(data, "artist")),
        title: SongProvider.recase(Map.get(data, "title")),
        cover_url: Map.get(data, "image")
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
