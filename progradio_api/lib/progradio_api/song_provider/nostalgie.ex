defmodule ProgRadioApi.SongProvider.Nostalgie do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.nostalgie.fr/onair"
  @minutes_delta_max 300
  @discarded_artist "NOSTALGIE"

  @stream_ids %{
    "nostalgie_main" => "197",
    "nostalgie_60" => "50",
    "nostalgie_70" => "51",
    "nostalgie_80" => "26",
    "nostalgie_90" => "32",
    "nostalgie_jazz" => "40",
    "nostalgie_funk" => "27"
  }

  @impl true
  def has_custom_refresh(), do: true

  @impl true
  def get_auto_refresh(_name, _data, default_refresh), do: default_refresh

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

      if item_end - @minutes_delta_max < now_unix do
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
          %{
            artist: SongProvider.recase(data["song"]["artist"]),
            title: SongProvider.recase(data["song"]["title"])
          }
        else
          %{}
        end
    end
  end
end
