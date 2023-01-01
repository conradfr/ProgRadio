defmodule ProgRadioApi.SongProvider.Contactfm do
  require Logger
  alias ProgRadioApi.SongProvider.GenericLesIndes2

  #  Radio was renamed Radio µontact on 11/2022
  #  Keeping old code_name for now

  @behaviour ProgRadioApi.SongProvider

  @url "https://api.radiocontact.fr/graphql"
  @radio_id "2174546520932614237"

  @impl true
  defdelegate has_custom_refresh(), to: GenericLesIndes2

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes2

  @impl true
  def get_data(name, _last_data) do
    GenericLesIndes2.get_data(@url, name, @radio_id)
  end

  @impl true
  defdelegate get_song(name, data), to: GenericLesIndes2
end
