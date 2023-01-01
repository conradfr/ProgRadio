defmodule ProgRadioApi.SongProvider.Urbanhit do
  require Logger
  alias ProgRadioApi.SongProvider.GenericLesIndes2

  @behaviour ProgRadioApi.SongProvider

  @url "https://api.urbanhit.fr/graphql"

  @stream_id %{
    "urbanhit_main" => "2174546520932614835",
    "urbanhit_nouveaute" => "4744031335849395977",
    "urbanhit_alancienne" => "3130341601832862929",
    "urbanhit_us" => "3130341601832862811"
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
