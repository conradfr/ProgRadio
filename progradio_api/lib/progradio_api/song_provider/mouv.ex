defmodule ProgRadioApi.SongProvider.Mouv do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "mouv_main" => "",
    "mouv_100mix" => "mouv_100mix",
    "mouv_kids_n_family" => "mouv_kids_n_family",
    "mouv_rapus" => "mouv_rapus",
    "mouv_rapfr" => "mouv_rapfr",
    "mouv_classics" => "mouv_classics"
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

    url = "https://www.radiofrance.fr/mouv/api/live?webradio=#{id}"

    try do
      url
      |> SongProvider.get()
      |> Map.get(:body)
      |> :json.decode()
    rescue
      _ -> :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      fallback =
        data
        |> Map.get("now", %{})
        |> Map.get("firstLine", %{})
        |> Map.get("title", nil)

      artist =
        data
        |> Map.get("now", %{})
        |> Map.get("secondLine", %{})
        |> Map.get("title", fallback)

      %{artist: artist, title: nil}
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
