defmodule ProgRadioApi.SongProvider.Rireetchansons do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.rireetchansons.fr/onair.json"
  @minutes_max_delta 300
  @discarded_artist "RIRE & CHANSONS"

  @stream_ids %{
    "rireetchansons_main" => "200",
    "rireetchansons_blagues" => "42",
    "rireetchansons_canulars" => "43",
    "rireetchansons_chansons_droles" => "1311",
    "rireetchansons_duos" => "925",
    "rireetchansons_collectors" => "41",
    "rireetchansons_nouvelle_generation" => "40",
    "rireetchansons_one_woman_show" => "907"
  }

  @impl true
  def has_custom_refresh(), do: true

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
    id =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()

    now_unix = SongProvider.now_unix()

    try do
      item =
        @url
        |> SongProvider.get()
        |> Map.get(:body)
        |> Jason.decode!()
        |> Enum.find(fn e -> Map.get(e, "id", 0) == id end)
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
      _ -> nil
    end
  end

  @impl true
  def get_song(name, data) do
    case data do
      nil ->
        Logger.info("Data provider - #{name}: error fetching song data or empty")
        %{}

      _ ->
        unless data["song"]["artist"] === @discarded_artist do
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
    end
  end
end
