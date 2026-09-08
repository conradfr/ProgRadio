defmodule ProgRadioApi.SongProvider.Jazzradio do
  alias ProgRadioApi.SongProvider.GenericWinradio

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.jazzradio.fr/winradio/prog"

  @stream_ids %{
    "jazzradio_main" => "",
    "jazzradio_blues" => 2,
    "jazzradio_funk" => 10,
    "jazzradio_manouche" => 7,
    "jazzradio_classicjazz" => 6,
    "jazzradio_electroswing" => 15,
    "jazzradio_pianojazz" => 31,
    "jazzradio_soul" => 11,
    "jazzradio_staxmotown" => 23,
    "jazzradio_onlywomen" => 24,
    "jazzradio_lounge" => 3,
    "jazzradio_neworleans" => 8,
    "jazzradio_nouveautesjazz" => 21,
    "jazzradio_blackmusic" => 1,
    "jazzradio_zenattitude" => 29,
    "jazzradio_latinjazz" => 14,
    "jazzradio_jazzcinema" => 26
  }

  @impl true
  defdelegate has_custom_refresh(name), to: GenericWinradio

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, last_data) do
    try do
      GenericWinradio.get_data(@url, name, @stream_ids, last_data)
    rescue
      _ -> :error
    end
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericWinradio
end
