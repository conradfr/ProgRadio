defmodule ProgRadioApi.SongProvider.Fip do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "fip_main" => 7,
    "fip_rock" => 64,
    "fip_jazz" => 65,
    "fip_groove" => 66,
    "fip_pop" => 78,
    "fip_electro" => 74,
    "fip_monde" => 69,
    "fip_reggae" => 71,
    "fip_nouveautes" => 70,
    "fip_metal" => 77,
    "fip_sacre_francais" => 96,
    "fip_hiphop" => 95
  }

  @refresh_fallback_s 3
  @refresh_fallback_ms 3000

  @impl true
  def has_custom_refresh(), do: true

  @impl true
  def get_refresh(_name, nil, default_refresh), do: default_refresh

  @impl true
  def get_refresh(_name, data, default_refresh) do
    next = Map.get(data, "delayToRefresh", default_refresh) + 5

    if next < @refresh_fallback_s do
      @refresh_fallback_ms
    else
      next
    end
  end

  @impl true
  def get_data(name, _last_data) do
    id =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()

    url = "https://api.radiofrance.fr/livemeta/live/#{id}/transistor_musical_player"

    try do
      url
      |> SongProvider.get()
      |> Map.get(:body)
      |> Jason.decode!()
    rescue
      _ -> nil
    end
  end

  @impl true
  def get_song(name, data) do
    case Map.get(data || %{}, "now") do
      nil ->
        Logger.info("Data provider - #{name}: error fetching song data or empty")
        %{}

      _ ->
        fallback =
          data
          |> Map.get("now", %{})
          |> Map.get("firstLine", nil)

        artist =
          data
          |> Map.get("now", %{})
          |> Map.get("secondLine", fallback)

        picture_id =
          data
          |> Map.get("now", %{})
          |> Map.get("cover")

        picture =
          case picture_id do
            nil -> nil
            _ -> "https://www.radiofrance.fr/pikapi/images/#{picture_id}/50x50"
          end

        %{artist: artist, title: nil, cover_url: picture}
    end
  end
end
