defmodule ProgRadioApi.SongProvider.Francemusique do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "francemusique_main" => "",
    "francemusique_baroque" => "francemusique_baroque",
    "francemusique_classique_easy" => "francemusique_classique_easy",
    "francemusique_piano_zen" => "francemusique_piano_zen",
    "francemusique_opera" => "francemusique_opera",
    "francemusique_concert_rf" => "francemusique_concert_rf",
    "francemusique_evenmentielle" => "francemusique_evenmentielle"
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

    url = "https://www.radiofrance.fr/francemusique/api/live?webradio=#{id}"

    try do
      url
      |> SongProvider.get()
      |> Map.get(:body)
      |> Jason.decode!()
      |> Map.get("now")
    rescue
      _ -> :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      artist =
        data
        |> Map.get("secondLine", %{})
        |> Map.get("title", nil)

      title =
        data
        |> Map.get("firstLine", %{})
        |> Map.get("title", nil)

      %{artist: artist, title: title}
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
