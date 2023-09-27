defmodule ProgRadioApi.SongProvider.Fip do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

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
      name
      |> SongProvider.get_stream_code_name_from_channel()
      |> case do
           value when value == "fip_main" -> "fip"
           value -> value
         end

    url = "https://www.radiofrance.fr/api/v2.1/stations/fip/live/webradios/#{id}"

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
        %{artist: Map.get(data["now"], "secondLine"), title: Map.get(data["now"], "firstLine")}
    end
  end
end
