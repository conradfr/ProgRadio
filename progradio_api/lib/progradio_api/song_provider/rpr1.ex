defmodule ProgRadioApi.SongProvider.Rpr1 do
  require Logger
  alias ProgRadioApi.SongProvider
  alias ProgRadioApi.SongProvider.GenericLoveradio

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "rpr1_livestream" => 9,
    "rpr1_nur_die_musik" => 183,
    "rpr1_weinstrasse" => 166,
    "rpr1_tanzbar" => 40,
    "rpr1_90er_dance" => 50,
    "rpr1_germany" => 121,
    "rpr1_nurburgring" => 47,
    "rpr1_80er" => 75,
    "rpr1_flashback" => 189,
    "rpr1_country" => 70,
    "rpr1_trier" => 54,
    "rpr1_koln" => 54,
    "rpr1_koblenz" => 76,
    "rpr1_mainz" => 115,
    "rpr1_pfalz" => 78,
    "rpr1_rhein_neckar" => 100,
    "rpr1_oldies" => 60,
    "rpr1_70er" => 34,
    "rpr1_90er" => 24,
    "rpr1_2000er" => 114,
    "rpr1_2010er" => 145,
    "rpr1_karneval" => 136,
    "rpr1_pappnasen" => 56,
    "rpr1_schinkenstrasse" => 52,
    "rpr1_sommerhits" => 43,
    "rpr1_chilloutzone" => 33,
    "rpr1_akustisch" => 27,
    "rpr1_weihnachtslieder" => 72,
    "rpr1_neue_deutsche_welle" => 25,
    "rpr1_deutsch_pop" => 65,
    "rpr1_schlager" => 59,
    "rpr1_kinderlieder" => 89,
    "rpr1_top50" => 97,
    "rpr1_musik_bar" => 197,
    "rpr1_kuschelrock" => 144,
    "rpr1_yoga_sounds" => 93,
    "rpr1_70er_rock" => 109,
    "rpr1_80er_pop_rock" => 30,
    "rpr1_rock" => 32,
    "rpr1_metal" => 64,
    "rpr1_sport_radio" => 110,
    "rpr1_old_school_hip_hop" => 20
  }

  @impl true
  defdelegate has_custom_refresh(name), to: GenericLoveradio

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLoveradio

  @impl true
  def get_data(name, _last_data) do
    id =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()

    GenericLoveradio.get_data("rpr1", id, "https://asw.api.iris.radiorepo.io/v2/playlist")
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLoveradio
end
