defmodule ProgRadioApi.SongProvider.Fusionfm do
  alias ProgRadioApi.SongProvider.GenericLesIndes
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "fusionfm_moulins" => "https://www.fusionfm.fr/cache/titreplayer13",
    "fusionfm_cluny" => "https://www.fusionfm.fr/cache/titreplayer16",
    "fusionfm_lapalisse" => "https://www.fusionfm.fr/cache/titreplayer10",
    "fusionfm_st_gervais" => "https://www.fusionfm.fr/cache/titreplayer18",
    "fusionfm_dompierre" => "https://www.fusionfm.fr/cache/titreplayer19",
    "fusionfm_clermont" => "https://www.fusionfm.fr/cache/titreplayer21",
    "fusionfm_vichy" => "https://www.fusionfm.fr/cache/titreplayer15",
    "fusionfm_luzy" => "https://www.fusionfm.fr/cache/titreplayer22",
    "fusionfm_montlucon" => "https://www.fusionfm.fr/cache/titreplayer20",
    "fusionfm_gueugnon" => "https://www.fusionfm.fr/cache/titreplayer12",
    "fusionfm_thiers" => "https://www.fusionfm.fr/cache/titreplayer17",
    "fusionfm_le_creusot" => "https://www.fusionfm.fr/cache/titreplayer14"
  }

  @impl true
  defdelegate has_custom_refresh(name), to: GenericLesIndes

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes

  @impl true
  def get_data(name, last_data) do
    url =
      name
      |> SongProvider.get_stream_code_name_from_channel()
      |> (&Map.get(@stream_ids, &1)).()

    GenericLesIndes.get_data(url, name, last_data)
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLesIndes
end
