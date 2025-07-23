defmodule ProgRadioApi.SongProvider.Deltaradio do
  require Logger
  alias ProgRadioApi.SongProvider
  alias ProgRadioApi.SongProvider.GenericLoveradio

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "deltaradio_live" => 3,
    "deltaradio_country" => 795,
    "deltaradio_uptempo_banger" => 753,
    "deltaradio_edm_dancefloor" => 755,
    "deltaradio_sommer" => 121,
    "deltaradio_good_vibes" => 754,
    "deltaradio_mitsingen" => 752,
    "deltaradio_tiktok" => 719,
    "deltaradio_brandneu" => 151,
    "deltaradio_chartbuster" => 720,
    "deltaradio_at_home" => 371,
    "deltaradio_buzz" => 152,
    "deltaradio_deutsch" => 150,
    "deltaradio_deutsch_rap_klassiker" => 421,
    "deltaradio_hamburg" => 246,
    "deltaradio_top100_dance" => 243,
    "deltaradio_top100_deutsch_rap" => 241,
    "deltaradio_mallorca_party" => 245,
    "deltaradio_top100_party" => 244,
    "deltaradio_der_best_rockpop" => 89,
    "deltaradio_unplugged" => 88,
    "deltaradio_xmas" => 198,
    "deltaradio_fusball_party" => 582
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

    GenericLoveradio.get_data("delta", id)
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLoveradio
end
