defmodule ProgRadioApi.SongProvider.Ado do
  alias ProgRadioApi.SongProvider.GenericLesIndes3

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.ado.fr/api/TitleDiffusions"

  @stream_ids %{
    "ado_main" => "4783069927323993818",
    "ado_backtoclassics" => "1017714469627007660",
    "ado_flashbacks" => "1017797892586508650",
    "ado_jayz" => "1017890309391601080",
    "ado_work" => "1016645505879195070",
    "ado_classicus" => "1016645469502469729",
    "ado_francais" => "1016645477432195881",
    "ado_rnb" => "1016645475770391991",
    "ado_us" => "1016645476768159207"
  }

  @impl true
  defdelegate has_custom_refresh(name), to: GenericLesIndes3

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes3

  @impl true
  def get_data(name, _last_data, _db_song_data) do
    GenericLesIndes3.get_data(@url, name, @stream_ids)
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLesIndes3
end
