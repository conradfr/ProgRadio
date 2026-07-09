defmodule ProgRadioApi.SongProvider.Jobsetmusik do
  alias ProgRadioApi.SongProvider.GenericLesIndes
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "jobsetmusik_main" => "https://www.jobsetmusik.com/cache/titreplayer13",
    "jobsetmusik_hits" => "https://www.banquisefm.com/cache/titreplayer4",
  }

  @impl true
  defdelegate has_custom_refresh(name), to: GenericLesIndes

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes

  @impl true
  def get_data(name, last_data) do
    url =
      name
      |> SongProvider.get_stream_code_name_from_channel()
      |> (&Map.get(@stream_ids, &1)).()

    GenericLesIndes.get_data(url, name, last_data)
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLesIndes
end
