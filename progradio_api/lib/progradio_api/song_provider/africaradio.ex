defmodule ProgRadioApi.SongProvider.Africaradio do
  require Logger
  alias ProgRadioApi.SongProvider.GenericLesIndes

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.africaradio.com/players/index/gettitrageplayer/idplayers/2180540611545792571"

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