defmodule ProgRadioApi.SongProvider.Radiostar do
  alias ProgRadioApi.SongProvider.GenericLesIndes2

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.radiostarsud.fr/graphql"

  @stream_ids %{
    "radiostar_toulon" => "2174546520932614699",
    "radiostar_marseille" => "2174546520932614699",
    "radiostar_star8090" => "3220136225736629303",
    "radiostar_love" => "3220136225736629324",
    "radiostar_autravail" => "3220136225736629380",
    "radiostar_dance" => "3220136225736629362",
    "radiostar_nouveautes" => "3220136225736629261",
    "radiostar_planete" => "3220136225736629344",
    "radiostar_france" => "3220136225736629282",
    "radiostar_tactic" => "3220136225736629402"
  }

  @impl true
  defdelegate has_custom_refresh(name), to: GenericLesIndes2

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes2

  @impl true
  def get_data(name, _last_data) do
    try do
      GenericLesIndes2.get_data(@url, name, @stream_ids)
    rescue
      _ -> :error
    end
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLesIndes2
end
