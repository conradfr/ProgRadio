defmodule ProgRadioApi.SongProvider.AutorouteInfo do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "autoroute_info_main" => "rhoneAlpes",
    "autoroute_info_centre_est" => "center",
    "autoroute_info_centre_sud_ouest" => "ouest",
  }

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, nil, default_refresh), do: default_refresh

  @impl true
  def get_data(name, _last_data) do
    key =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()

    try do
      "https://autorouteinfo.pro/api/info_live.json"
      |> SongProvider.get()
      |> Map.get(:body)
      |> Jason.decode!()
      |> Map.get("networks", %{})
      |> Map.get(key, %{})
      |> Map.get("audio", nil)
    rescue
      _ -> nil
    end
  end

  @impl true
  def get_song(name, data) do
    case data do
      nil ->
        Logger.info("Data provider - #{name}: error fetching song data or empty")
        %{}

      _ ->
        %{artist: Map.get(data, "artist"), title: Map.get(data, "title")}
    end
  end
end
