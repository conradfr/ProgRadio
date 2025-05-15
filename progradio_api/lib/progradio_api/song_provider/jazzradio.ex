defmodule ProgRadioApi.SongProvider.Jazzradio do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "jazzradio_main" => "",
    "jazzradio_blues" => 2,
    "jazzradio_funk" => 10,
    "jazzradio_manouche" => 7,
    "jazzradio_classicjazz" => 6,
    "jazzradio_electroswing" => 15,
    "jazzradio_pianojazz" => 31,
    "jazzradio_soul" => 11,
    "jazzradio_staxmotown" => 23,
    "jazzradio_onlywomen" => 24,
    "jazzradio_lounge" => 3,
    "jazzradio_neworleans" => 8,
    "jazzradio_nouveautesjazz" => 21,
    "jazzradio_blackmusic" => 1,
    "jazzradio_zenattitude" => 29,
    "jazzradio_latinjazz" => 14,
    "jazzradio_jazzcinema" => 26
  }

  @max_duration_minutes 10

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    now_unix = SongProvider.now_unix()

    id =
      name
      |> SongProvider.get_stream_code_name_from_channel()
      |> (&Map.get(@stream_ids, &1)).()

    try do
      "https://www.jazzradio.fr/winradio/prog#{id}.xml?=#{now_unix}"
      |> SongProvider.get()
      |> Map.get(:body)
      |> XmlToMap.naive_map()
      |> Map.get("prog", %{})
      |> Map.get("morceau", [])
      |> Enum.find(nil, fn e ->
        try do
          time_start =
            e
            |> Map.get("#content", %{})
            |> Map.get("date_prog")
            |> NaiveDateTime.from_iso8601!()
            |> DateTime.from_naive!("Europe/Paris")
            |> DateTime.to_unix()

          # we don't know the duration ...
          time_end = time_start + @max_duration_minutes * 60
          now_unix >= time_start and now_unix <= time_end
        rescue
          _ -> nil
        end
      end)
    rescue
      _ -> :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      %{
        artist: SongProvider.recase(data["#content"]["chanteur"]),
        title: SongProvider.recase(data["#content"]["chanson"]),
        cover_url: data["#content"]["pochette"] || nil
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
