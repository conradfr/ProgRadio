defmodule ProgRadioApi.SongProvider.Rfm do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "rfm_main" => "3",
    "rfm_couleur" => "3003",
    "rfm_or" => "3015",
    "rfm_fraiche" => "3014",
    "rfm_francais" => "3011"
  }

  @url "http://directradio.rfm.fr/rfm/now/"

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    id =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()

    (@url <> id)
    |> SongProvider.get()
    |> Map.get(:body)
    |> :json.decode()
    |> Map.get("current", %{})
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      %{
        artist: SongProvider.recase(Map.get(data, "artist")),
        title: SongProvider.recase(Map.get(data, "title")),
        cover_url: Map.get(data, "cover")
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
