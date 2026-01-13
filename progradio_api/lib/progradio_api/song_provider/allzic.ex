defmodule ProgRadioApi.SongProvider.Allzic do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "allzic_annees70" => "3107",
    "allzic_annees80" => "3",
    "allzic_classic_piano" => "3105",
    "allzic_latino" => "2596",
    "allzic_funk" => "122",
    "allzic_dance_floor" => "8"
  }

  @url "https://www.allzicradio.com/lite/update_onair"

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    try do
      id =
        name
        |> SongProvider.get_stream_code_name_from_channel()
        |> (&Map.get(@stream_ids, &1)).()

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
