defmodule ProgRadioApi.SongProvider.Radiobob do
  require Logger
  alias ProgRadioApi.SongProvider.GenericLoveradio
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "radiobob_livestream" => 65,
    "radiobob_dab+" => 61,
    "radiobob_alternative" => 15,
    "radiobob_classic_rock" => 16,
    "radiobob_acdc" => 72,
    "radiobob_power_metal" => 664,
    "radiobob_symphonic_metal" => 510,
    "radiobob_progrock" => 566,
    "radiobob_rock_party" => 384,
    "radiobob_best_rock" => 96,
    "radiobob_70_rock" => 665,
    "radiobob_80_rock" => 97,
    "radiobob_90_rock" => 98,
    "radiobob_2000_rock" => 565,
    "radiobob_harte_saite" => 14,
    "radiobob_mittel_rock" => 234,
    "radiobob_wacken" => 135,
    "radiobob_metal" => 99,
    "radiobob_stoner" => 690,
    "radiobob_ska" => 682,
    "radiobob_punk" => 103,
    "radiobob_blues" => 557,
    "radiobob_deutschrock" => 81,
    "radiobob_nu_metal" => 745,
    "radiobob_mittel_alter" => 234,
    "radiobob_hardrock" => 101,
    "radiobob_rock_hits" => 95,
    "radiobob_grunge" => 102,
    "radiobob_metalcore" => 347,
    "radiobob_death_metal" => 511,
    "radiobob_roadtrip" => 688,
    "radiobob_folk" => 687,
    "radiobob_country" => 567,
    "radiobob_festival" => 105,
    "radiobob_gothic" => 235,
    "radiobob_rockabilly" => 104,
    "radiobob_christmas" => 76
  }

  @impl true
  defdelegate has_custom_refresh(), to: GenericLoveradio

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLoveradio

  @impl true
  def get_data(name, _last_data) do
    id =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()

    GenericLoveradio.get_data("bob", id)
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLoveradio
end
