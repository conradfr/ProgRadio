defmodule ProgRadioApi.SongProvider.Champagne do
  alias ProgRadioApi.SongProvider.GenericLesIndes3

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.champagnefm.com/api/TitleDiffusions"

  @stream_ids %{
    "champagnefm_main" => "2174546520932614213",
    "champagnefm_chalons" => "2174546520932614213",
    "champagnefm_charleville" => "2174546520932614213",
    "champagnefm_chateau_thierry" => "2174546520932614213",
    "champagnefm_epernay" => "2174546520932614213",
    "champagnefm_reims" => "2174546520932614213",
    "champagnefm_rethel" => "2174546520932614213",
    "champagnefm_saint_dizier" => "2174546520932614213",
    "champagnefm_troyes" => "2174546520932614213",
    "champagnefm_acoustic" => "1016352373067536711",
    "champagnefm_love" => "1016352367332682438",
    "champagnefm_party" => "1016352371737253962",
    "champagnefm_pop_music" => "1016352374760996339"
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
