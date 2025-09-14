defmodule ProgRadioApi.SongProvider.Radiolabelleaventure do
  require Logger

  @behaviour ProgRadioApi.SongProvider

  @url "https://widgetsv2.mediacpanel.com/webplayerv2/common/interval.php?user=tyizqrhg&fingerprinting="

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    try do
      @url
      |> Req.post!(
        form: [nowPlaying: "1"],
        headers: [{"Cache-Control", "no-cache"}],
        redirect: false,
        connect_options: [timeout: 15_000]
      )
      |> Map.get(:body)
      |> :json.decode()
      |> List.first()
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (radiolabelleaventure): data error rescue")
        :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      title =
        case Map.get(data, "title") do
          nil -> nil
          value -> String.replace(value, " by <br>", "")
        end

      %{
        artist: Map.get(data, "artist"),
        title: title,
        cover_url: Map.get(data, "artwork")
      }
    rescue
      _ ->
        Logger.debug(
          "Data provider - #{name} (radiolabelleaventure): error fetching song data or empty"
        )

        :error
    end
  end
end
