defmodule ProgRadioApi.SongProvider.Toulousefm do
  require Logger
  alias ProgRadioApi.SongProvider.GenericLesIndes2

  @behaviour ProgRadioApi.SongProvider

  @url "https://apib.toulouse.fm/graphql"

  @stream_id %{
    "toulousefm_main" => "2174546520932614821",
    "toulousefm_bodega" => "3120757949245428885",
    "toulousefm_no_french" => "1016450085188641387"
  }

  @impl true
  defdelegate has_custom_refresh(), to: GenericLesIndes2

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes2

  @impl true
  def get_data(name, _last_data) do
    GenericLesIndes2.get_data(@url, name, @stream_id)
  end

  @impl true
  defdelegate get_song(name, data), to: GenericLesIndes2
end
