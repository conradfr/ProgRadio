defmodule ProgRadioApi.SongProvider.Freepi do
  require Logger
  alias ProgRadioApi.SongProvider

  # adapted from asura_hosting.ex

  @behaviour ProgRadioApi.SongProvider

  @provider_name "freepi"

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    #    SongProvider.get_icecast_data(name, @provider_name)
  end

  @impl true
  def get_song(name, data, _last_song) do
    #    SongProvider.get_song_from_shoutcast_or_icecast(data, name, @provider_name)
  end
end
