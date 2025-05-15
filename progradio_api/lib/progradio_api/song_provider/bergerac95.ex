defmodule ProgRadioApi.SongProvider.Bergerac95 do
  require Logger
  alias ProgRadioApi.SongProvider.GenericLesIndes

  @behaviour ProgRadioApi.SongProvider

  @url "http://www.bergerac95.fr/cache/titreplayer3016923902222997121"

  @impl true
  defdelegate has_custom_refresh(), to: GenericLesIndes

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes

  @impl true
  def get_data(name, last_data) do
    GenericLesIndes.get_data(@url, name, last_data)
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLesIndes
end
