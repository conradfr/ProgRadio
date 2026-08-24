defmodule ProgRadioApi.SongProvider.ActivRadio do
  alias ProgRadioApi.SongProvider.GenericLesIndes2
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.activradio.com/graphql"

  @stream_ids %{
    "activ_radio_firminy" => "2174546520932614159",
    "activ_radio_saintetienne" => "2174546520932614159",
    "activ_radio_roanne" => "2174546520932614159",
    "activ_radio_supporters" => "1016390682520981576",
    "activ_radio_before" => "4631180576815055312",
  }

  @impl true
  defdelegate has_custom_refresh(name), to: GenericLesIndes2

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes2

  @impl true
  def get_data(name, _last_data) do
    try do
      id =
        SongProvider.get_stream_code_name_from_channel(name)
        |> (&Map.get(@stream_ids, &1)).()

      GenericLesIndes2.get_data(@url, name, id)
    rescue
      _ -> :error
    end
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLesIndes2
end
