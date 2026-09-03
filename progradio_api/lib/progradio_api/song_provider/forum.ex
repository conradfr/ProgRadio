defmodule ProgRadioApi.SongProvider.Forum do
  alias ProgRadioApi.SongProvider.GenericLesIndes3

  @behaviour ProgRadioApi.SongProvider

  #  @url "https://api.forum.fr/graphql"
  @url "https://www.forum.fr/api/TitleDiffusions"

  @stream_ids %{
    "forum_main" => "2174546520932614334",
    "forum_angers" => "2174546520932614334",
    "forum_angouleme" => "2174546520932614334",
    "forum_bellac" => "2174546520932614334",
    "forum_blois" => "2174546520932614334",
    "forum_chateaurenault" => "2174546520932614334",
    "forum_chateauroux" => "2174546520932614334",
    "forum_chatellerault" => "2174546520932614334",
    "forum_chauvigny" => "2174546520932614334",
    "forum_cholet" => "2174546520932614334",
    "forum_civray" => "2174546520932614334",
    "forum_confolens" => "2174546520932614334",
    "forum_gencay" => "2174546520932614334",
    "forum_oleron" => "2174546520932614334",
    "forum_rocheposay" => "2174546520932614334",
    "forum_larochelle" => "2174546520932614334",
    "forum_limoges" => "2174546520932614334",
    "forum_loudun" => "2174546520932614334",
    "forum_montmorillon" => "2174546520932614334",
    "forum_niort" => "2174546520932614334",
    "forum_orleans" => "2174546520932614334",
    "forum_parthenay" => "2174546520932614334",
    "forum_poitiers" => "2174546520932614334",
    "forum_romorantin" => "2174546520932614334",
    "forum_ruffec" => "2174546520932614334",
    "forum_saintsavin" => "2174546520932614334",
    "forum_saumur" => "2174546520932614334",
    "forum_saintjunien" => "2174546520932614334",
    "forum_saintmaixent" => "2174546520932614334",
    "forum_thouars" => "2174546520932614334",
    "forum_tours" => "2174546520932614334",
    "forum_vendome" => "2174546520932614334",
    "forum_divas" => "1017766987767617258",
    "forum_flashback70" => "3328710072053287594",
    "forum_flashback80" => "3328710072053287757",
    "forum_flashback90" => "3328710072053287787",
    "forum_backto2000" => "3328710072053287817",
    "forum_funk" => "1017739959861219052",
    "forum_workhits" => "3328710072053287845",
    "forum_discofever" => "1017710003521351682",
    "forum_francais" => "3554890196675908298",
    "forum_legends" => "1016696278192869584",
    "forum_love" => "3328710072053287872",
    "forum_love" => "3328710072053287872"
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
