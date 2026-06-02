defmodule ProgRadioApi.SongProvider.FranceBleu do
  alias ProgRadioApi.SongProvider
  alias ProgRadioApi.SongProvider.GenericRadioFrance

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "france_bleu_alsace" => "12",
    "france_bleu_armorique" => "13",
    "france_bleu_auxerre" => "14",
    "france_bleu_azur" => "49",
    "france_bleu_bassenormandie" => "37",
    "france_bleu_bearn" => "15",
    "france_bleu_belfortmontbeliard" => "16",
    "france_bleu_berry" => "17",
    "france_bleu_besancon" => "18",
    "france_bleu_bourgogne" => "19",
    "france_bleu_breizhizel" => "20",
    "france_bleu_champagneardenne" => "21",
    "france_bleu_cotentin" => "22",
    "france_bleu_creuse" => "23",
    "france_bleu_dromeardeche" => "24",
    "france_bleu_elsass" => "90",
    "france_bleu_gardlozere" => "25",
    "france_bleu_gascogne" => "26",
    "france_bleu_gironde" => "27",
    "france_bleu_hautenormandie" => "38",
    "france_bleu_herault" => "28",
    "france_bleu_isere" => "29",
    "france_bleu_larochelle" => "30",
    "france_bleu_limousin" => "31",
    "france_bleu_loireocean" => "32",
    "france_bleu_lorrainenord" => "33",
    "france_bleu_main" => "68",
    "france_bleu_maine" => "91",
    "france_bleu_mayenne" => "34",
    "france_bleu_nord" => "36",
    "france_bleu_occitanie" => "92",
    "france_bleu_orleans" => "39",
    "france_bleu_paris" => "68",
    "france_bleu_paysbasque" => "41",
    "france_bleu_paysdauvergne" => "40",
    "france_bleu_paysdesavoie" => "42",
    "france_bleu_perigord" => "43",
    "france_bleu_picardie" => "44",
    "france_bleu_poitou" => "54",
    "france_bleu_provence" => "45",
    "france_bleu_rcfm" => "11",
    "france_bleu_roussillon" => "46",
    "france_bleu_saintetienneloire" => "93",
    "france_bleu_sudlorraine" => "",
    "france_bleu_touraine" => "47",
    "france_bleu_vaucluse" => "48"
  }

  @impl true
  defdelegate has_custom_refresh(name), to: GenericRadioFrance

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericRadioFrance

  @impl true
  def get_data(name, last_data) do
    id =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()

    url = "https://api.radiofrance.fr/livemeta/live/#{id}/transistor_bleu_player"

    GenericRadioFrance.get_data(url, name, last_data)
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericRadioFrance
end
