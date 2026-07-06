defmodule ProgRadioApi.SongProvider.CentpourcentRadio do
  alias ProgRadioApi.SongProvider.GenericLesIndes3

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.centpourcent.com/api/TitleDiffusions"

  @stream_id %{
    "centpourcent_radio_pau" => "2174544699860189189",
    "centpourcent_radio_albi" => "2174544699860189189",
    "centpourcent_radio_auch" => "2174544699860189189",
    "centpourcent_radio_cahors" => "2174544699860189189",
    "centpourcent_radio_carcassonne" => "2174544699860189189",
    "centpourcent_radio_castres" => "2174544699860189189",
    "centpourcent_radio_foix" => "2174544699860189189",
    "centpourcent_radio_lozere" => "2174544699860189189",
    "centpourcent_radio_millau" => "2174544699860189189",
    "centpourcent_radio_montauban" => "2174544699860189189",
    "centpourcent_radio_herault" => "2174544699860189189",
    "centpourcent_radio_payscatalan" => "2174544699860189189",
    "centpourcent_radio_stgaudens" => "2174544699860189189",
    "centpourcent_radio_tarbes" => "2174544699860189189",
    "centpourcent_radio_toulouse" => "2174544699860189189",
  }

  @impl true
  defdelegate has_custom_refresh(name), to: GenericLesIndes3

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes3

  @impl true
  def get_data(name, _last_data) do
    IO.puts("###################################")
    IO.puts("#{inspect name}")
    GenericLesIndes3.get_data(@url, name, @stream_id)
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLesIndes3
end
