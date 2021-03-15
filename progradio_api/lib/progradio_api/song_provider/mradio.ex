defmodule ProgRadioApi.SongProvider.Mradio do
  require Logger

  @behaviour ProgRadioApi.SongProvider

  @radio_lag 10

  @impl true
  def has_custom_refresh(), do: true

  @impl true
  def get_refresh(_name, data, default_refresh) do
    case data do
      nil ->
        @radio_lag * 1000

      _ ->
        try do
          now_unix =
            DateTime.now!("Europe/Paris")
            |> DateTime.to_unix()

          time_start =
            data
            |> Map.get("#content", %{})
            |> Map.get("date_prog")
            |> NaiveDateTime.from_iso8601!()
            |> DateTime.from_naive!("Europe/Paris")
            |> DateTime.to_unix()

          {duration, _} =
            data
            |> Map.get("#content", %{})
            |> Map.get("duration")
            |> Time.from_iso8601!()
            |> Time.to_seconds_after_midnight()

          next = time_start + duration + @radio_lag - now_unix

          if time_start + next < now_unix do
            @radio_lag * 1000
          else
            next * 1000
          end
        rescue
          _ -> default_refresh
        end
    end
  end

  @impl true
  def get_data(_name) do
    now_unix =
      DateTime.now!("Europe/Paris")
      |> DateTime.to_unix()

    HTTPoison.get!(
      "https://mradio.fr/winradio/prog.xml",
      [],
      ssl: [ciphers: :ssl.cipher_suites(), versions: [:"tlsv1.2", :"tlsv1.1", :tlsv1]]
    )
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

        {duration, _} =
          e
          |> Map.get("#content", %{})
          |> Map.get("duration")
          |> Time.from_iso8601!()
          |> Time.to_seconds_after_midnight()

        time_end = time_start + duration
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
        %{interpreter: data["#content"]["chanteur"], title: data["#content"]["chanson"]}
    end
  end
end
