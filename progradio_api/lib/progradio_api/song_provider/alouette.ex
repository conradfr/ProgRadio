defmodule ProgRadioApi.SongProvider.Alouette do
  alias ProgRadioApi.SongProvider.GenericLesIndes3

  @behaviour ProgRadioApi.SongProvider

  #  @url "https://apib.alouette.fr/graphql"
  @url "https://www.alouette.fr/api/TitleDiffusions"

  @stream_ids %{
    "alouette_main" => "2174546520932614169",
    "alouette_charente" => "2174546520932614169",
    "alouette_charente_maritime" => "2174546520932614169",
    "alouette_correze" => "2174546520932614169",
    "alouette_cotes_darmor" => "2174546520932614169",
    "alouette_creuse" => "2174546520932614169",
    "alouette_deux_sevres" => "2174546520932614169",
    "alouette_finistere" => "2174546520932614169",
    "alouette_gironde" => "2174546520932614169",
    "alouette_haute_vienne" => "2174546520932614169",
    "alouette_ille_et_vilaine" => "2174546520932614169",
    "alouette_indre" => "2174546520932614169",
    "alouette_indre_et_loire" => "2174546520932614169",
    "alouette_loire_atlantique" => "2174546520932614169",
    "alouette_loiret" => "2174546520932614169",
    "alouette_maine_et_loire" => "2174546520932614169",
    "alouette_mayenne" => "2174546520932614169",
    "alouette_morbihan" => "2174546520932614169",
    "alouette_sarthe" => "2174546520932614169",
    "alouette_vendee" => "2174546520932614169",
    "alouette_vienne" => "2174546520932614169",
    "alouette_leclub" => "1016557270027194219",
    "alouette_nouveaux_talents" => "4212315587551961584",
    "alouette_indie" => "1016933988966041839"
  }

  @impl true
  defdelegate has_custom_refresh(name), to: GenericLesIndes3

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes3

  @impl true
  def get_data(name, _last_data) do
    GenericLesIndes3.get_data(@url, name, @stream_ids)
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLesIndes3
end
