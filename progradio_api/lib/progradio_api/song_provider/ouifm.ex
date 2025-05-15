defmodule ProgRadioApi.SongProvider.Ouifm do
  require Logger
  alias ProgRadioApi.SongProvider.GenericLesIndes3

  @behaviour ProgRadioApi.SongProvider

  #  @url "https://api.mycontact.fr/graphql"
  @url "https://www.ouifm.fr/api/TitleDiffusions"

  @stream_id %{
    "ouifm_main" => "2174546520932614531",
    "ouifm_bringthenoise" => "4004502594738215513",
    "ouifm_classicrock" => "3134161803443976427",
    "ouifm_acoustic" => "3906034555622012146",
    "ouifm_rockfrancais" => "3820775684199026845"
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
  defdelegate get_song(name, data, last_song), to: GenericLesIndes3
end
