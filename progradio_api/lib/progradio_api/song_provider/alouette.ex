defmodule ProgRadioApi.SongProvider.Alouette do
  require Logger
  alias ProgRadioApi.SongProvider.GenericLesIndes2

  @behaviour ProgRadioApi.SongProvider

  @url "https://apib.alouette.fr/graphql"
  @radio_id "2174546520932614169"

  @impl true
  defdelegate has_custom_refresh(), to: GenericLesIndes2

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes2

  @impl true
  defdelegate get_auto_refresh(name, data, default_refresh), to: GenericLesIndes2

  @impl true
  def get_data(name, _last_data) do
    GenericLesIndes2.get_data(@url, name, @radio_id)
  end

  @impl true
  defdelegate get_song(name, data), to: GenericLesIndes2
end
