defmodule ProgRadioApi.SongProvider.Fip do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @refresh_fallback 3

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
    "fip_metal" => 77
  }

  @impl true
  def has_custom_refresh(), do: true

  @impl true
  def get_refresh(_name, nil, default_refresh), do: default_refresh

  @impl true
  def get_refresh(_name, data, default_refresh) do
    now_unix = SongProvider.now_unix()
    next = Map.get(data, "delayToRefresh", now_unix + default_refresh) + 5 - now_unix

    if next < @refresh_fallback do
      @refresh_fallback * 1000
    else
      next
    end
  end

  @impl true
  def get_data(name, _last_data) do
    id =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()

    url =
      "https://api.radiofrance.fr/livemeta/live/#{id}/webrf_fip_player"

    try do
      data =
        url
        |> SongProvider.get()
        |> Map.get(:body)
        |> Jason.decode!()

      now_unix = SongProvider.now_unix()

      if data != nil and Map.get(data, "now") != nil
          and Map.get(data["now"], "startTime") != nil and Map.get(data["now"], "endTime") != nil
          and now_unix >= data["now"]["startTime"] and now_unix <= data["now"]["endTime"] do
        data
      else
        nil
      end
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
