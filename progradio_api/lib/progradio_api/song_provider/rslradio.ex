defmodule ProgRadioApi.SongProvider.Rslradio do
  require Logger
  alias ProgRadioApi.SongProvider.GenericLesIndes

  @behaviour ProgRadioApi.SongProvider

  @url "https://rslradio1.radio-site.com/cache/titreplayer7"

  @impl true
  defdelegate has_custom_refresh(), to: GenericLesIndes

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes

  @impl true
  def get_data(name, last_data) do
    GenericLesIndes.get_data(@url, name, last_data)
  end

  @impl true
  defdelegate get_song(name, data), to: GenericLesIndes
end
