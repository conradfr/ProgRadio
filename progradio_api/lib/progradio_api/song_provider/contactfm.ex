defmodule ProgRadioApi.SongProvider.Contactfm do
  require Logger
  alias ProgRadioApi.SongProvider.GenericLesIndes3

  #  Radio was renamed Radio µontact on 11/2022
  #  Keeping old code_name for now

  @behaviour ProgRadioApi.SongProvider

  #  @url "https://api.radiocontact.fr/graphql"
  @url "https://www.radiocontact.fr/api/TitleDiffusions"

  @radio_id "2174546520932614237"

  @impl true
  defdelegate has_custom_refresh(), to: GenericLesIndes3

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes3

  @impl true
  def get_data(name, _last_data) do
    GenericLesIndes3.get_data(@url, name, @radio_id)
  end

  @impl true
  defdelegate get_song(name, data), to: GenericLesIndes3
end
