defmodule ProgRadioApi.SongProvider.Dkl do
  alias ProgRadioApi.SongProvider.GenericLesIndesEvent

  @behaviour ProgRadioApi.SongProviderPush

  @stream_ids %{
    "dkl_mulhouse_altkirch" => "2174546520932614597",
    "dkl_strasbourg" => "2174546520932614597",
    "dkl_selestat" => "2174546520932614597",
    "dkl_haguenau_wissembourg" => "2174546520932614597",
    "dkl_flashback80" => "1017073967805039328",
    "dkl_noel" => "1016674879037812251",
    "dkl_centpourcent_francais" => "1016848564949433316",
    "dkl_annees60" => "1016848545597404633",
    "dkl_annees70" => "1016848558164874310",
    "dkl_disco" => "1016848566934252413",
    "dkl_tonton_robby" => "1016412247427629151",
    "dkl_generations" => "1016848577921822314",
    "dkl_chansons_allemandes" => "3175595464957726376",
    "dkl_vos_plus_belles_chansons" => "3540892623380218592",
    "dkl_apres_ski" => "4293345840717640047",
    "dkl_crooner" => "3175595464957726456",
    "dkl_elsass_music" => "4507816041694364397",
    "dkl_radio_liberte" => "4507816041694365691"
  }

  @impl true
  def get_push_client_pid(name) do
    try do
      GenericLesIndesEvent.get_push_client_pid("https://www.radiodkl.com/ws/metas?id=", name, @stream_ids)
    rescue
      _ -> :error
    end
  end

  @impl true
  defdelegate get_data(name, push_event, last_data), to: GenericLesIndesEvent

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLesIndesEvent

end
