defmodule ProgRadioApi.SongProvider.Rouge do
  require Logger
  alias ProgRadioApi.SongProvider.GenericLesIndes
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "rouge_main" => 3,
    "rouge_suisse" => 20,
    "rouge_clubstory" => 10
  }

  @url "https://www.rouge.ch/cache/titreplayer"

  @impl true
  defdelegate has_custom_refresh(), to: GenericLesIndes

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLesIndes

  @impl true
  def get_data(name, last_data) do
    id =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()
      |> Integer.to_string()

    GenericLesIndes.get_data(@url <> id, name, last_data)
  end

  @impl true
  defdelegate get_song(name, data), to: GenericLesIndes
end
