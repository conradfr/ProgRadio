defmodule ProgRadioApi.SongProvider.AsuraHosting do
  require Logger
  alias ProgRadioApi.SongProvider

  # doc https://www.asurahosting.com/guides/streaming/centovacast/obtaining-your-https-link/

  @behaviour ProgRadioApi.SongProvider

  @provider_name "asura_hosting"

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    Logger.debug("Data provider - #{name} (#{@provider_name}): data")

    # stream can be icecast or shoutcast and will have different metadata endpoint

    cond do
      # todo not do cond has shoutcast failing will move to icecast?
      String.contains?(name, "/stream") -> SongProvider.get_shoutcast_data(name, @provider_name)
      String.contains?(name, "/live") -> SongProvider.get_icecast_data(name, @provider_name)
      true -> nil
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    SongProvider.get_song_from_shoutcast_or_icecast(data, name, @provider_name)
  end
end
