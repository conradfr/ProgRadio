defmodule ProgRadioApi.SongProvider.Rca do
  alias ProgRadioApi.SongProvider.GenericLesIndes3

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.rcalaradio.com/api/TitleDiffusions"

  @stream_ids %{
    "rca_nantes" => "2174546520932614587",
    "rca_baindebretagnes" => "2174546520932614587",
    "rca_challans" => "2174546520932614587",
    "rca_chateaubriant" => "2174546520932614587",
    "rca_larochesuryon" => "2174546520932614587",
    "rca_les_sables_dolonne" => "2174546520932614587",
    "rca_nozay" => "2174546520932614587",
    "rca_rennes" => "2174546520932614587",
    "rca_saint_nazaire" => "21745465209326145879"
  }

  @impl true
  defdelegate has_custom_refresh(name), to: GenericLesIndes3

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes3

  @impl true
  def get_data(name, _last_data, _db_song_data) do
    GenericLesIndes3.get_data(@url, name, @stream_ids)
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLesIndes3
end
