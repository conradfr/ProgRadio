defmodule ProgRadioApi.SongProvider.Regenbogen do
  require Logger
  alias ProgRadioApi.SongProvider
  alias ProgRadioApi.SongProvider.GenericLoveradio

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "regenbogen_livestream" => 135,
    "regenbogen_nur_die_musik" => 184,
    "regenbogen_workout" => 26,
    "regenbogen_soft_lazy" => 102,
    "regenbogen_flashback" => 165,
    "regenbogen_tanzbar" => 45,
    "regenbogen_90er_dance" => 94,
    "regenbogen_top40" => 98,
    "regenbogen_80er" => 19,
    "regenbogen_kinderlieder" => 126,
    "regenbogen_baten_wurttemberg" => 204,
    "regenbogen_rein_neckar" => 107,
    "regenbogen_mittelbaden" => 96,
    "regenbogen_sudbaden" => 11,
    "regenbogen_von_morgens" => 196,
    "regenbogen_kuschelrock" => 143,
    "regenbogen_unplugged" => 15,
    "regenbogen_oldies" => 87,
    "regenbogen_90er" => 13,
    "regenbogen_2000er" => 29,
    "regenbogen_2010er" => 142,
    "regenbogen_tanzbar" => 45,
    "regenbogen_latin_hits" => 21,
    "regenbogen_konfetti" => 77,
    "regenbogen_soft_beat" => 164,
    "regenbogen_sommerhits" => 188,
    "regenbogen_christmas" => 117,
    "regenbogen_schlager" => 125,
    "regenbogen_deutsch_pop" => 116,
    "regenbogen_rock" => 129,
    "regenbogen_70er_rock" => 131,
    "regenbogen_80er_pop_rock" => 171,
    "regenbogen_modern_rock" => 132,
    "regenbogen_adler_mannheim" => 80
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

    GenericLoveradio.get_data("regenbogen", id, "https://asw.api.iris.radiorepo.io/v2/playlist")
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLoveradio
end
