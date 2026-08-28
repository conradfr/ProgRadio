defmodule ProgRadioApi.SongProvider.Arl do
  alias ProgRadioApi.SongProvider.GenericLesIndes2
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.arlradio.fr/graphql"

  @stream_ids %{
    "arl_main" => "2174546520932614182",
    "arl_70s" => "1016793015844838166",
    "arl_80s" => "1016793017762041371",
    "arl_party" => "1016793024013984422"
  }

  @impl true
  defdelegate has_custom_refresh(name), to: GenericLesIndes2

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes2

  @impl true
  def get_data(name, _last_data) do
    try do
      id =
        name
        |> SongProvider.get_stream_code_name_from_channel()
        |> (&Map.get(@stream_ids, &1)).()

      GenericLesIndes2.get_data(@url, name, id)
    rescue
      _ -> :error
    end
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLesIndes2
end
