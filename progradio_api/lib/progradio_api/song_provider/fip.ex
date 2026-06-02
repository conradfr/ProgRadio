defmodule ProgRadioApi.SongProvider.Fip do
  alias ProgRadioApi.SongProvider
  alias ProgRadioApi.SongProvider.GenericRadioFrance

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "fip_main" => 7,
    "fip_rock" => 64,
    "fip_jazz" => 65,
    "fip_groove" => 66,
    "fip_pop" => 78,
    "fip_electro" => 74,
    "fip_monde" => 69,
    "fip_reggae" => 71,
    "fip_nouveautes" => 70,
    "fip_metal" => 77,
    "fip_sacre_francais" => 96,
    "fip_hiphop" => 95,
    "fip_cultes" => 709
  }

  @impl true
  defdelegate has_custom_refresh(name), to: GenericRadioFrance

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericRadioFrance

  @impl true
  def get_data(name, last_data) do
    id =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()

    url = "https://api.radiofrance.fr/livemeta/live/#{id}/transistor_musical_player"

    GenericRadioFrance.get_data(url, name, last_data)
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericRadioFrance
end
