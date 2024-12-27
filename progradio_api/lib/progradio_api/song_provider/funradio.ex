defmodule ProgRadioApi.SongProvider.Funradio do
  require Logger
  alias ProgRadioApi.SongProvider.GenericRtlgroup

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.funradio.fr/quel-est-ce-titre/"

  @impl true
  defdelegate has_custom_refresh(), to: GenericRtlgroup

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericRtlgroup

  @impl true
  def get_data(_name, _last_data) do
    GenericRtlgroup.get_data(@url)
  end

  @impl true
  defdelegate get_song(name, data), to: GenericRtlgroup
end
