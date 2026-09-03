defmodule ProgRadioApi.SongProvider.Lovely do
  alias ProgRadioApi.SongProvider.GenericLesIndes3

  @behaviour ProgRadioApi.SongProvider

  #  @url "https://api.radiolovely.fr/graphql"
  @url "https://www.radiolovely.fr/api/TitleDiffusions"

  @stream_ids %{
    "lovely_main" => "2174546520932614275",
    "lovely_lovely80" => "1017743633724507886",
    "lovely_lovelyslow" => "1017800472195136427"
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
