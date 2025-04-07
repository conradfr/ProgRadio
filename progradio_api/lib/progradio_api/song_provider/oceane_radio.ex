defmodule ProgRadioApi.SongProvider.OceaneRadio do
  require Logger
  alias ProgRadioApi.SongProvider.GenericLesIndes3
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @url "https://oceane.ouest-france.fr/api/TitleDiffusions"

  @stream_ids %{
    "oceane_radio_main" => "2174546520932614511",
    "oceane_radio_rouen" => "2174546520932614511",
    "oceane_radio_saint_nazaire" => "2174546520932614511",
    "oceane_radio_roche_yon" => "2174546520932614511",
    "oceane_radio_guingamp" => "2174546520932614511",
    "oceane_radio_vannes" => "2174546520932614511",
    "oceane_radio_concarneau" => "2174546520932614511",
    "oceane_radio_lorient" => "2174546520932614511",
    "oceane_radio_paimpol" => "2174546520932614511",
    "oceane_radio_roche_bernard" => "2174546520932614511",
    "oceane_radio_redon" => "2174546520932614511",
    "oceane_radio_questembert" => "2174546520932614511",
    "oceane_radio_guer" => "2174546520932614511",
    "oceane_radio_rennes" => "2174546520932614511",
    "oceane_radio_ploermel" => "2174546520932614511",
    "oceane_radio_chateaulin" => "2174546520932614511",
    "oceane_radio_lannion" => "2174546520932614511",
    "oceane_radio_quimper" => "2174546520932614511",
    "oceane_radio_80" => "1016896050327779448",
    "oceane_radio_francais" => "1016896072341387635",
    "oceane_radio_classic_rock" => "1016956473760324734",
    "oceane_radio_clazz" => "4179277137246699829",
  }

  @impl true
  defdelegate has_custom_refresh(), to: GenericLesIndes3

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes3

  @impl true
  def get_data(name, _last_data) do
    id =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()

    GenericLesIndes3.get_data(@url, name, id)
  end

  @impl true
  defdelegate get_song(name, data), to: GenericLesIndes3
end