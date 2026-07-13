defmodule ProgRadioApi.SongProvider.RadioCaroline do
  alias ProgRadioApi.SongProvider.GenericLesIndes
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "radio_caroline_main" => "https://www.radiocaroline.bzh/cache/titreplayer2174546520932614580",
    "radio_caroline_carocelt" =>
      "https://www.radiocaroline.bzh/cache/titreplayer3554890196675807369",
    "radio_caroline_carogold" =>
      "https://www.radiocaroline.bzh/cache/titreplayer3289937280548165099",
    "radio_caroline_carocool" =>
      "https://www.radiocaroline.bzh/cache/titreplayer3554890196675807371",
    "radio_caroline_carorock" =>
      "https://www.radiocaroline.bzh/cache/titreplayer3554890196675807372"
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
