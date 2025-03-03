defmodule ProgRadioApi.SongProvider.Beurfm do
  require Logger
  alias ProgRadioApi.SongProvider.GenericLesIndes3

  @behaviour ProgRadioApi.SongProvider

  #  @url "https://api.beurfm.net/graphql"
  @url "https://www.beurfm.net/api/TitleDiffusions"

  @radio_id "2174546520932614189"

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
