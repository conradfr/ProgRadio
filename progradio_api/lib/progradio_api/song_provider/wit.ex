defmodule ProgRadioApi.SongProvider.Wit do
  alias ProgRadioApi.SongProvider.GenericLesIndes3

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.ado.fr/api/TitleDiffusions"

  @stream_ids %{
    "wit_bordeaux" => "2453443399508820009",
    "wit_arcachon" => "2453443399508820009",
    "wit_perigueux" => "2453443399508820009",
    "wit_flashback80" => "3202359450568621736",
    "wit_flashback90" => "3202359450568621778",
    "wit_backto2000" => "3202359450568621815",
    "wit_work_hits" => "3202359450568622118",
    "wit_dancefloor" => "3202359450568621857",
    "wit_centpourcent_francais" => "3554890196675908324",
    "wit_lounge" => "3202359450568621997",
    "wit_love_stories" => "3202359450568622034"
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
