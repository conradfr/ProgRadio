defmodule ProgRadioApi.DataProvider.FipMain do
  require Logger

  @behaviour ProgRadioApi.DataProvider

  @impl true
  def get_refresh(_name, data, default_refresh) do
    case data do
      nil ->
        nil

      _ ->
        now_unix =
          DateTime.utc_now()
          |> DateTime.to_unix()

        abs(
          Map.get(data, "next_refresh", now_unix + default_refresh / 1000) + 2 -
            now_unix
        ) * 1000
    end
  end

  @impl true
  def get_data(_name) do
    HTTPoison.get!(
      "https://www.fip.fr/latest/api/graphql?operationName=NowList&variables={\"bannerPreset\":\"266x266\",\"stationIds\":[7]}&extensions={\"persistedQuery\":{\"version\":1,\"sha256Hash\":\"151ca055b816d28507dae07f9c036c02031ed54e18defc3d16feee2551e9a731\"}}",
      [],
      ssl: [ciphers: :ssl.cipher_suites(), versions: [:"tlsv1.2", :"tlsv1.1", :tlsv1]]
    )
    |> Map.get(:body)
    |> Jason.decode!()
    |> Map.get("data", %{})
    |> Map.get("nowList", %{})
    |> List.first()
  end

  @impl true
  def get_song(name, data) do
    case data do
      nil ->
        Logger.info("Data provider - #{name}: error fetching song data or empty")
        %{}

      _ ->
        %{interpreter: data["playing_item"]["title"], title: data["playing_item"]["subtitle"]}
    end
  end
end
