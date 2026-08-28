defmodule ProgRadioApi.SongProvider.Franceinfo do
  alias ProgRadioApi.SongProvider
  alias ProgRadioApi.SongProvider.GenericRadioFrance

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "franceinfo_main" => "2"
  }

  @impl true
  defdelegate has_custom_refresh(name), to: GenericRadioFrance

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericRadioFrance

  @impl true
  def get_data(name, last_data) do
    id =
      name
      |> SongProvider.get_stream_code_name_from_channel()
      |> SongProvider.get_id_from_list(@stream_ids)

    url = "https://api.radiofrance.fr/livemeta/live/#{id}/transistor_info_player"

    GenericRadioFrance.get_data(url, name, last_data)
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericRadioFrance
end
