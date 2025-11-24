defmodule ProgRadioApi.SongProvider.Radio80s80s do
  require Logger
  alias ProgRadioApi.SongProvider
  alias ProgRadioApi.SongProvider.GenericLoveradio

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "radio80s80s_livestream" => 62,
    "radio80s80s_inthemix" => 558,
    "radio80s80s_love" => 85,
    "radio80s80s_italo_disco" => 283,
    "radio80s80s_wave" => 284,
    "radio80s80s_dm" => 87,
    "radio80s80s_romantic_rock" => 792,
    "radio80s80s_maxis" => 596,
    "radio80s80s_funk_soul" => 517,
    "radio80s80s_rock" => 440,
    "radio80s80s_party" => 252,
    "radio80s80s_deutsch" => 618,
    "radio80s80s_dark_wave" => 672,
    "radio80s80s_alternative" => 788,
    "radio80s80s_dance" => 673,
    "radio80s80s_ndw" => 137,
    "radio80s80s_dinnerparty" => 660,
    "radio80s80s_live" => 635,
    "radio80s80s_jackson" => 156,
    "radio80s80s_ebm" => 718,
    "radio80s80s_hip_hop" => 647,
    "radio80s80s_techno" => 780,
    "radio80s80s_wgt" => 773,
    "radio80s80s_neo" => 616,
    "radio80s80s_breakdance" => 659,
    "radio80s80s_reggae" => 777,
    "radio80s80s_queen" => 617,
    "radio80s80s_bowie" => 84,
    "radio80s80s_prince" => 111,
    "radio80s80s_pop_stories" => 772,
    "radio80s80s_summer" => 569
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

    GenericLoveradio.get_data("80s80s", id)
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLoveradio
end
