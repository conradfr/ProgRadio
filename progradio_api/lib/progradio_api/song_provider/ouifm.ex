defmodule ProgRadioApi.SongProvider.Ouifm do
  require Logger
  alias ProgRadioApi.SongProvider.GenericLesIndes2
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @url "https://api.mycontact.fr/graphql"

  @stream_id %{
    "ouifm_main" => "2174546520932614531",
    "ouifm_bringthenoise" => "4004502594738215513",
    "ouifm_classicrock" => "3134161803443976427",
    "ouifm_acoustic" => "3906034555622012146",
    "ouifm_rockfrancais" => "3820775684199026845"
  }

  @impl true
  defdelegate has_custom_refresh(), to: GenericLesIndes2

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes2

  @impl true
  defdelegate get_auto_refresh(name, data, default_refresh), to: GenericLesIndes2

  @impl true
  def get_data(name, _last_data) do
    radio_id =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_id, &1)).()

    GenericLesIndes2.get_data(@url, name, radio_id)
  end

  @impl true
  defdelegate get_song(name, data), to: GenericLesIndes2
end
