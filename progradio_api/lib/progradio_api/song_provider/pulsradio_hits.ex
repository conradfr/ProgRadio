defmodule ProgRadioApi.SongProvider.PulsradioHits do
  require Logger
  alias ProgRadioApi.SongProvider.GenericPulsradio
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "pulsradio_hits_main" => "hits",
    "pulsradio_uk" => "uk",
    "pulsradio_lounge" => "lounge",
    "pulsradio_80" => "80s",
    "pulsradio_90" => "90s",
    "pulsradio_2000" => "2000"
  }

  @impl true
  defdelegate has_custom_refresh(name), to: GenericPulsradio

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericPulsradio

  @impl true
  def get_data(name, last_data) do
    id =
      name
      |> SongProvider.get_stream_code_name_from_channel()
      |> (&Map.get(@stream_ids, &1)).()

    GenericPulsradio.get_data(id, name, last_data)
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericPulsradio
end
