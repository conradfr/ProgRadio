defmodule ProgRadioApi.SongProvider.Topmusic do
  alias ProgRadioApi.SongProvider.GenericLesIndes3

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.topmusic.fr/api/TitleDiffusions"

  @stream_ids %{
    "topmusic_main" => "2174546520932614807",
    "topmusic_saintmarieauxmines" => "2174546520932614807",
    "topmusic_schirmeck" => "2174546520932614807",
    "topmusic_selestat" => "2174546520932614807",
    "topmusic_colmar" => "2174546520932614807",
    "topmusic_mulhouse" => "2174546520932614807",
    "topmusic_sarrebourg" => "2174546520932614807",
    "topmusic_strasbourg" => "2174546520932614807",
    "topmusic_saverne" => "2174546520932614807",
    "topmusic_top80" => "1016693677289767126",
    "topmusic_topfitness" => "1017785770928129122",
    "topmusic_toplove" => "1016693676195413678",
  }

  @impl true
  defdelegate has_custom_refresh(name), to: GenericLesIndes3

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes3

  @impl true
  def get_data(name, _last_data) do
    try do
      GenericLesIndes3.get_data(@url, name, @stream_ids)
    rescue
      _ -> :error
    end
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLesIndes3
end
