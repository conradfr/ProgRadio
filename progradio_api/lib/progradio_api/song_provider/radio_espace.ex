defmodule ProgRadioApi.SongProvider.RadioEspace do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "radio_espace_main" => "1",
    "radio_espace_frenchmix" => "22",
    "radio_espace_classics" => "21",
    "radio_espace_frenchtouch" => "15",
    "radio_espace_latino" => "14",
    "radio_espace_hot30" => "3",
    "radio_espace_club" => "5",
    "radio_espace_dance90" => "4",
    "radio_espace_djlyonnais" => "17",
    "radio_espace_lalouradio" => "20"
  }

  @url "https://www.radioespace.com/lite/update_onair"

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data, _db_song_data) do
    try do
      id =
        name
        |> SongProvider.get_stream_code_name_from_channel()
        |> SongProvider.get_id_from_list(@stream_ids)

      @url
      |> Req.post!(
        headers: [
          {"Cache-Control", "no-cache"}
        ],
        json: %{
          radio_ids: [id]
        },
        redirect: false,
        connect_options: [timeout: 15_000]
      )
      |> Map.get(:body)
      |> Map.get(id, nil)
    rescue
      _ -> :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      %{
        artist: Map.get(data, "artist"),
        title: Map.get(data, "title"),
        cover_url: Map.get(data, "cover")
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
