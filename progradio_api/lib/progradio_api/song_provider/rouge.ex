defmodule ProgRadioApi.SongProvider.Rouge do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "rouge_main" => 4,
    "rouge_best_hits" => 2401,
    "rouge_classic_rock" => 2401,
    "rouge_platine" => 2403,
    "rouge_80s" => 2404,
    "rouge_france" => 2405,
    "rouge_90s" => 2406,
    "rouge_zen" => 2407,
    "rouge_latino" => 2408,
    "rouge_2000" => 2409,
    "rouge_love" => 2410,
    "rouge_rock" => 2411,
    "rouge_disco" => 2412,
    "rouge_reggae" => 2413,
    "rouge_talents_suisse" => 2414,
    "rouge_us_urban" => 2415,
    "rouge_urban_francais" => 2416,
    "rouge_70s" => 2417,
    "rouge_2010" => 2418,
    "rouge_cine" => 2419,
    "rouge_xmas" => 2420,
    "rouge_italia" => 2421,
  }

  @impl true
  def has_custom_refresh(), do: true

  def get_refresh(_name, _data, default_refresh), do: default_refresh

  # TODO
#  @impl true
#  def get_refresh(name, nil, default_refresh), do: default_refresh
#
#  @impl true
#  def get_refresh(name, data, default_refresh) do
#
#  end

  @impl true
  def get_data(name, last_data) do
    id =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()
      |> Integer.to_string()

    data =
      "https://www.mediaone-digital.ch/cache/#{id}.json"
      |> SongProvider.get()
      |> Map.get(:body)
      |> Jason.decode!()
      |> Map.get("live", [])

    case length(data) do
      0 -> nil
      _ -> hd(data)
    end
  end

  @impl true
  def get_song(name, data) do
    case data do
      nil ->
        Logger.info("Data provider - #{name}: error fetching song data or empty")
        %{}

      _ ->
        artist = Map.get(data, "interpret")
        title = Map.get(data, "title")

        %{artist: artist, title: title}
    end
  end
end
