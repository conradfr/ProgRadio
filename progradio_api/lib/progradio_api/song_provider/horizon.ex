defmodule ProgRadioApi.SongProvider.Horizon do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "horizon_main" => "principal",
    "horizon_h2000" => "horizon-2000",
    "horizon_h70" => "horizon-70",
    "horizon_h80" => "horizon-80",
    "horizon_h90" => "horizon-90",
    "horizon_love" => "horizon-love",
    "horizon_retroparty" => "horizon-retro-party"
  }

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, nil, default_refresh), do: default_refresh

  @impl true
  def get_data(name, _last_data, _db_song_data) do
    id =
      name
      |> SongProvider.get_stream_code_name_from_channel()
      |> SongProvider.get_id_from_list(@stream_ids)

    url = "https://www.horizonactu.fr/ajax/refresh-radio-title.php?radio=#{id}"

    try do
      url
      |> SongProvider.get_json()
      |> Map.get("now", nil)
    rescue
      _ -> :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      artist = Map.get(data, "artiste")
      title = Map.get(data, "titre")
      cover_url = Map.get(data, "pochette")

      %{
        artist: artist,
        title: title,
        cover_url: cover_url
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
