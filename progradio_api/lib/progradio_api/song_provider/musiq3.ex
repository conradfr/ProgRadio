defmodule ProgRadioApi.SongProvider.Musiq3 do
  require Logger
  alias ProgRadioApi.SongProvider.GenericRtbs

  @behaviour ProgRadioApi.SongProvider

  @id "musiq3"

  @impl true
  defdelegate has_custom_refresh(), to: GenericRtbs

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericRtbs

  @impl true
  def get_data(name, last_data) do
    GenericRtbs.get_data(@id, name, last_data)
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericRtbs
end
