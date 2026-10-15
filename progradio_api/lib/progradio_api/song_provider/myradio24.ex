defmodule ProgRadioApi.SongProvider.Myradio24 do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  # ex: https://listen6.myradio24.com/73212, https://myradio24.org/5967
  # only numeric mounts are the station id
  @regex ~r/myradio24\.(?:com|org)(?::\d+)?\/(\d+)(?:[_?\/]|$)/

  # the api is only on the main domain, not on the listenN ones
  @base_url "https://myradio24.com"

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data, _db_song_data) do
    try do
      [_, id] = Regex.run(@regex, name)

      "#{@base_url}/users/#{id}/status.json"
      |> SongProvider.get_json()
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (myradio24): data error rescue")
        :error
    end
  end

  @impl true
  def get_song(_name, %{"online" => online}, _last_song) when online != 1, do: nil

  def get_song(name, data, _last_song) do
    try do
      artist = clean(Map.get(data, "artist"))
      title = clean(Map.get(data, "songtitle"))
      song = clean(Map.get(data, "song"))

      Logger.debug("Data provider - #{name} (myradio24): data - #{song}")

      cond do
        # we discard suspicious/incomplete entries
        song in SongProvider.get_forbidden_titles() ->
          nil

        artist != nil and title != nil ->
          %{artist: artist, title: title, cover_url: cover_url(Map.get(data, "img"))}

        song != nil ->
          %{artist: song, title: nil, cover_url: cover_url(Map.get(data, "img"))}

        true ->
          nil
      end
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end

  # relative path, with a placeholder image when there is no cover
  defp cover_url(image) when is_binary(image) and image != "" do
    cond do
      String.contains?(image, "nocover") -> nil
      String.starts_with?(image, "http") -> image
      true -> @base_url <> "/" <> String.trim_leading(image, "/")
    end
  end

  defp cover_url(_image), do: nil

  defp clean(value) when is_binary(value) do
    case String.trim(value) do
      "" -> nil
      trimmed -> trimmed
    end
  end

  defp clean(_value), do: nil
end
