defmodule ProgRadioApi.SongProvider.Lyonpremiere do
  require Logger
  alias ProgRadioApi.SongProvider.GenericLesIndes

  @behaviour ProgRadioApi.SongProvider

  @url "https://radioutils.infomaniak.com/player/lyon1ere/config/699095b8-7891-4b84-9af0-e8e1b58157d3"

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
