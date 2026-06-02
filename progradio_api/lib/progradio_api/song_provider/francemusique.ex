defmodule ProgRadioApi.SongProvider.Francemusique do
  alias ProgRadioApi.SongProvider
  alias ProgRadioApi.SongProvider.GenericRadioFrance

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "francemusique_main" => "4",
    "francemusique_baroque" => "408",
    "francemusique_classique_easy" => "401",
    "francemusique_piano_zen" => "410",
    "francemusique_opera" => "409",
    "francemusique_concert_rf" => "403",
    "francemusique_jazz" => "405",
    "francemusique_contemporaine" => "406",
    "francemusique_classique_love" => "411",
    "francemusique_films" => "407",
    "francemusique_classique_plus" => "402",
    "francemusique_ocora" => "404"
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
