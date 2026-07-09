defmodule ProgRadioApi.SongProvider.Canalfm do
  alias ProgRadioApi.SongProvider.GenericLesIndes2

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.canalfm.fr/graphql"
  @radio_id "2174546520932614206"

  @impl true
  defdelegate has_custom_refresh(name), to: GenericLesIndes2

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes2

  @impl true
  def get_data(name, _last_data) do
    GenericLesIndes2.get_data(@url, name, @radio_id)
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLesIndes2
end
