defmodule ProgRadioApi.SongProvider.Virageradio do
  alias ProgRadioApi.SongProvider.GenericWinradio

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.virageradio.com/winradio/prog.xml"

  @impl true
  defdelegate has_custom_refresh(name), to: GenericWinradio

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, last_data) do
    try do
      GenericWinradio.get_data(@url, name, last_data)
    rescue
      _ -> :error
    end
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericWinradio
end
