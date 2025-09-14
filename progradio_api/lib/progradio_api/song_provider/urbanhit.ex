defmodule ProgRadioApi.SongProvider.Urbanhit do
  require Logger
  alias ProgRadioApi.SongProvider.GenericLesIndes3

  @behaviour ProgRadioApi.SongProvider

  #  @url "https://api.urbanhit.fr/graphql"
  @url "https://www.urbanhit.fr/api/TitleDiffusions"

  @stream_id %{
    "urbanhit_main" => "2174546520932614835",
    "urbanhit_nouveaute" => "4744031335849395977",
    "urbanhit_alancienne" => "3130341601832862929",
    "urbanhit_us" => "3130341601832862811"
  }

  @impl true
  defdelegate has_custom_refresh(name), to: GenericLesIndes3

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes3

  @impl true
  def get_data(name, _last_data) do
    GenericLesIndes3.get_data(@url, name, @stream_id)
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLesIndes3
end
