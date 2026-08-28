defmodule ProgRadioApi.SongProvider.Hitwest do
  alias ProgRadioApi.SongProvider.GenericLesIndes3
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  #  @url "https://api-hitwest.ouest-france.fr/graphql"
  @url "https://hitwest.ouest-france.fr/api/TitleDiffusions"

  @stream_ids %{
    "hitwest_main" => "2174546520932614388",
    "hitwest_angers" => "2174546520932614388",
    "hitwest_brest" => "2174546520932614388",
    "hitwest_carhaix" => "2174546520932614388",
    "hitwest_chateaubriant" => "2174546520932614388",
    "hitwest_cholet" => "2174546520932614388",
    "hitwest_dinan" => "2174546520932614388",
    "hitwest_laroche" => "2174546520932614388",
    "hitwest_laval" => "2174546520932614388",
    "hitwest_lemans" => "2174546520932614388",
    "hitwest_lessables" => "2174546520932614388",
    "hitwest_lorient" => "2174546520932614388",
    "hitwest_loudeac" => "2174546520932614388",
    "hitwest_morlaix" => "2174546520932614388",
    "hitwest_nantes" => "2174546520932614388",
    "hitwest_ploermel" => "2174546520932614388",
    "hitwest_quimper" => "2174546520932614388",
    "hitwest_redon" => "2174546520932614388",
    "hitwest_rennes" => "2174546520932614388",
    "hitwest_saintbrieuc" => "2174546520932614388",
    "hitwest_saintgilles" => "2174546520932614388",
    "hitwest_saintmalo" => "2174546520932614388",
    "hitwest_saintnazaire" => "2174546520932614388",
    "hitwest_vannes" => "2174546520932614388",
    "hitwest_freshhits" => "1017242489958657160",
    "hitwest_hitsdumoment" => "1017646916377205479",
    "hitwest_hit80" => "3217165268006472620",
    "hitwest_hit90" => "1016956441011284427",
    "hitwest_hit2000" => "1017079151606906691",
  }

  @impl true
  defdelegate has_custom_refresh(name), to: GenericLesIndes3

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes3

  @impl true
  def get_data(name, _last_data) do
    try do
      id =
        name
        |> SongProvider.get_stream_code_name_from_channel()
        |> (&Map.get(@stream_ids, &1)).()

      GenericLesIndes3.get_data(@url, name, id)
    rescue
      _ -> :error
    end
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLesIndes3
end
