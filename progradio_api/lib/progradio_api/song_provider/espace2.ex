defmodule ProgRadioApi.SongProvider.Espace2 do
  require Logger
  alias ProgRadioApi.SongProvider.GenericRts

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.rts.ch/hbv7/ajax/audio-podcast/livepopup/rts-espace2/"
  @minutes_max_delta 7

  @impl true
  defdelegate has_custom_refresh(), to: GenericRts

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericRts

  @impl true
  def get_data(name, last_data) do
    GenericRts.get_data(@url, name, last_data)
  end

  @impl true
  def get_song(name, data, _last_song) do
    GenericRts.get_song(@minutes_max_delta, name, data)
  end
end
