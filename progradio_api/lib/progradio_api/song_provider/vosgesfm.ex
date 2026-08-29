defmodule ProgRadioApi.SongProvider.Vosgesfm do
  alias ProgRadioApi.SongProvider.GenericLesIndes
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.vosgesfm.fr/players/index/gettitrageplayer/idplayers/"

  @stream_ids %{
    "vosgesfm_bruyeres" => "10",
    "vosgesfm_remiremont" => "11",
    "vosgesfm_epinal" => "12",
    "vosgesfm_cornimont" => "14",
  }

  @impl true
  defdelegate has_custom_refresh(name), to: GenericLesIndes

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes

  @impl true
  def get_data(name, last_data) do
    id =
      name
      |> SongProvider.get_stream_code_name_from_channel()
      |> SongProvider.get_id_from_list(@stream_ids)

    GenericLesIndes.get_data(@url <> id, name, last_data)
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLesIndes
end
