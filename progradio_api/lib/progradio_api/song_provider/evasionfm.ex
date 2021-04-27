defmodule ProgRadioApi.SongProvider.Evasionfm do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @minutes_max 300
  @timezone "Europe/Paris"

  @impl true
  def has_custom_refresh(), do: true

  @impl true
  def get_refresh(_name, _data, default_refresh), do: default_refresh

  @impl true
  def get_data(_name) do
    now_unix =
      DateTime.now!(@timezone)
      |> DateTime.to_unix()

    HTTPoison.get!(
      "https://www.evasionfm.com/XML/morceaux.xml",
      [],
      ssl: [ciphers: :ssl.cipher_suites(), versions: [:"tlsv1.2", :"tlsv1.1", :tlsv1]]
    )
    |> Map.get(:body)
    |> XmlToMap.naive_map()
    |> Map.get("listeMorceaux", %{})
    |> Map.get("morceau", [])
    |> Enum.find(nil, fn e ->
      try do
        time_start =
          e
          |> Map.get("heure")
          |> Timex.parse!("{h24}h{m}")
          |> NaiveDateTime.to_time()
          |> (&DateTime.new!(DateTime.now!(@timezone) |> DateTime.to_date(), &1, @timezone)).()
          |> DateTime.to_unix()

        time_end = time_start + @minutes_max
        now_unix >= time_start and now_unix <= time_end
      rescue
        _ -> nil
      end
    end)
  end

  @impl true
  def get_song(name, data) do
    case data do
      nil ->
        Logger.info("Data provider - #{name}: error fetching song data or empty")
        %{}

      _ ->
        %{artist: SongProvider.recase(data["artiste"]), title: SongProvider.recase(data["titre"])}
    end
  end
end
