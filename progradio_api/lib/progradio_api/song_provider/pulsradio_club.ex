defmodule ProgRadioApi.SongProvider.PulsradioClub do
  require Logger
  alias ProgRadioApi.SongProvider.GenericPulsradio

  @behaviour ProgRadioApi.SongProvider

  @id "club"

  @impl true
  defdelegate has_custom_refresh(name), to: GenericPulsradio

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericPulsradio

  @impl true
  def get_data(name, last_data) do
    GenericPulsradio.get_data(@id, name, last_data)
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericPulsradio
end
