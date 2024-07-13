defmodule ProgRadioApi.SongProvider.Toulousefm do
  require Logger
  alias ProgRadioApi.SongProvider.GenericLesIndes3

  @behaviour ProgRadioApi.SongProvider

  #  @url "https://apib.toulouse.fm/graphql"
  @url "https://www.toulousefm.fr/api/TitleDiffusions"

  @stream_id %{
    "toulousefm_main" => "2174546520932614821",
    "toulousefm_bodega" => "3120757949245428885",
    "toulousefm_no_french" => "1016450085188641387"
  }

  @impl true
  defdelegate has_custom_refresh(), to: GenericLesIndes3

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes3

  @impl true
  def get_data(name, _last_data) do
    GenericLesIndes3.get_data(@url, name, @stream_id)
  end

  @impl true
  defdelegate get_song(name, data), to: GenericLesIndes3
end
