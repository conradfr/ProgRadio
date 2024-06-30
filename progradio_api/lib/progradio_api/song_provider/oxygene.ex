defmodule ProgRadioApi.SongProvider.Oxygene do
  require Logger
  alias ProgRadioApi.SongProvider.GenericLesIndes
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "oxygene_main" => "4",
    "oxygene_sud77" => "1",
    "oxygene_provins" => "2",
    "oxygene_coulommiers" => "3",
    "oxygene_meaux" => "5"
  }

  @impl true
  defdelegate has_custom_refresh(), to: GenericLesIndes

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes

  @impl true
  def get_data(name, last_data) do
    id =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()

    url = "https://www.radiooxygene.fr/cache/titreplayer#{id}"

    GenericLesIndes.get_data(url, name, last_data)
  end

  @impl true
  defdelegate get_song(name, data), to: GenericLesIndes
end
