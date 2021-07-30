defmodule ProgRadioApi.SongProvider.Forum do
  require Logger
  alias ProgRadioApi.SongProvider.GenericLesIndes2

  @behaviour ProgRadioApi.SongProvider

  @url "https://api.forum.fr/graphql"
  @radio_id "2174546520932614334"

  @impl true
  defdelegate has_custom_refresh(), to: GenericLesIndes2

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes2

  @impl true
  defdelegate get_auto_refresh(name, data, default_refresh), to: GenericLesIndes2

  @impl true
  def get_data(name, last_data) do
    GenericLesIndes2.get_data(@url, name, @radio_id)
  end

  @impl true
  defdelegate get_song(name, data), to: GenericLesIndes2
end
