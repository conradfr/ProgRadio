defmodule ProgRadioApi.SongProvider.Chantefrance do
  require Logger
  alias ProgRadioApi.SongProvider.GenericLesIndes2

  @behaviour ProgRadioApi.SongProvider

  @url "https://api.chantefrance.com/graphql"

  @stream_id %{
    "chantefrance_main" => "2174546520932614220",
    "chantefrance_80s" => "3120757949245428885",
    "chantefrance_70s" => "3120757949245428849",
    "chantefrance_60s" => "3120757949245428808",
    "chantefrance_emotion" => "3120757949245428980",
    "chantefrance_nouveautes" => "3120757949245428941"
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
