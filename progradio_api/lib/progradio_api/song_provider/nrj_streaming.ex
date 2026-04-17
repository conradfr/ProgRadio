defmodule ProgRadioApi.SongProvider.Nrjstreaming do
  require Logger
  alias ProgRadioApi.SongProvider
  alias ProgRadioApi.Cache

  @behaviour ProgRadioApi.SongProvider

  @urls %{
      "nrj" => "https://www.nrj.fr/onair.json",
      "nostalgie" => "https://www.nostalgie.fr/onair.json",
      "cherie" => "https://www.cheriefm.fr/onair.json",
      "rireetchansons" => "https://www.rireetchansons.fr/onair.json"
    }

  @minutes_max_delta 300
  @discarded_artist ["NRJ", "Nostalgie", "Chérie", "Rire & Chansons"]

  @cache_key_onair_prefix "nrjstreaming_onair"
  @cache_key_onair_ttl 30_0000
  @cache_key_stream_prefix "nrjstreaming_stream_"
  @cache_key_stream_ttl 3600_0000

  @impl true
  def has_custom_refresh(_name), do: true

  @impl true
  def get_refresh(_name, nil, default_refresh), do: default_refresh

  @impl true
  def get_refresh(_name, data, default_refresh) do
    now_unix = SongProvider.now_unix()

    end_unix =
      data
      |> Map.get("end_timestamp", now_unix)
      |> Kernel.trunc()

    case end_unix - now_unix do
      next_refresh when next_refresh > 0 -> next_refresh * 1000
      _ -> default_refresh
    end
  end

  @impl true
  def get_data(name, _last_data) do
    try do
      "url:" <> url_full = name
      url = String.replace(url_full, ~r/\?.*/, "")

      now_unix = SongProvider.now_unix()
      regex = ~r/streaming\.nrjaudio\.fm\/([^?]+)/

      [_, id] = Regex.run(regex, name)

      {str_radio, str_number} = get_stream_number(id, url)
      data = get_onair(@url[str_radio], str_radio)

      item =
        data
        |> Enum.find(%{}, fn e -> Map.get(e, "id", "0") == str_number end)
        |> Map.get("playlist", %{})
        |> Enum.filter(fn e ->
          end_unix =
            e
            |> Map.get("end_timestamp", 0)
            |> Kernel.trunc()

          end_unix >= now_unix
        end)
        |> Enum.sort(fn first, last ->
          end_first =
            first
            |> Map.get("end_timestamp", 0)
            |> Kernel.trunc()

          end_last =
            last
            |> Map.get("end_timestamp", 0)
            |> Kernel.trunc()

          end_first <= end_last
        end)
        |> List.first()

      item_end =
        item
        |> Map.get("end_timestamp", 0)
        |> Kernel.trunc()

      if item_end - @minutes_max_delta < now_unix do
        item
      else
        nil
      end
    rescue
      reason ->
        Logger.debug("Data provider - #{name} (nrj): caught error #{inspect(reason)}")
        :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      unless data["song"]["artist"] in @discarded_artist do
        artist =
          data
          |> Map.get("song", %{})
          |> Map.get("artist")

        title =
          data
          |> Map.get("song", %{})
          |> Map.get("title")

        cover =
          data
          |> Map.get("song", %{})
          |> Map.get("img_url")

        %{
          artist: SongProvider.recase(artist),
          title: SongProvider.recase(title),
          cover_url: cover
        }
      else
        %{}
      end
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end

  defp get_onair(url, radio_id) do
    case Cache.has_key?(@cache_key_onair_prefix <> radio_id) do
      true ->
        Cache.get(@cache_key_onair_prefix <> radio_id)

      false ->
        data =
          url
          |> SongProvider.get()
          |> JSON.decode!()

        Cache.put(@cache_key_onair_prefix <> radio_id, data, ttl: @cache_key_onair_ttl)
        data
    end
  end

  defp get_stream_number(id, stream_url) do
    case Cache.has_key?(@cache_key_stream_prefix <> id) do
      true ->
        Cache.get(@cache_key_stream_prefix <> id)

      false ->
        value =
          Enum.find_value(@urls, fn {radio_id, url} ->
            case get_onair(url, radio_id) do
              list when is_list(list) ->
                Enum.find_value(list, fn entry ->
                  if Map.get(entry, "url_128k_mp3") == stream_url or
                     Map.get(entry, "url_64k_aac") == stream_url or
                     Map.get(entry, "url_hd_aac") == stream_url do
                    {radio_id, entry["id"]}
                  end
                end)
              _ -> nil
            end
          end)

        Cache.put(@cache_key_stream_prefix <> id, value, ttl: @cache_key_stream_ttl)
        value
    end
  end
end
