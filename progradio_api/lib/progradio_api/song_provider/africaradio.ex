defmodule ProgRadioApi.SongProvider.Africaradio do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "africaradio_main" => "principal",
    "africaradio_abidjan" => "abidjan",
    "africaradio_club" => "club",
    "africaradio_coupe_dk" => "coupe_dk",
    "africaradio_mandingue" => "mandingue",
    "africaradio_naija" => "naija",
    "africaradio_manu-dibango-forever" => "manu-dibango-forever",
    "africaradio_rumba" => "rumba",
    "africaradio_selecta" => "selecta"
  }

  @refresh_fallback_s 3
  @refresh_fallback_ms 3000

  @impl true
  def has_custom_refresh(_name), do: true

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

    url = "https://www.africaradio.com/ajax/refresh-radio-title.php?radio=#{id}"

    try do
      url
      |> SongProvider.get()
      |> Map.get(:body)
      |> :json.decode()
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

      %{artist: artist, title: title}
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
