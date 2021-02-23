defmodule ProgRadioApi.DataProvider.FipMain do
  use GenServer, restart: :transient
  require Logger
  alias ProgRadioApiWeb.Presence

  @name "song:fip_main"

  @refresh_song_interval 30000
  @refresh_presence_interval 10000

  # ----- Client Interface -----

  def start_link(_arg) do
    name = {:via, Registry, {SongDataProviderRegistry, @name}}
    GenServer.start_link(__MODULE__, %{}, name: name)
  end

  # ----- Server callbacks -----

  @impl true
  def init(state) do
    Logger.info("Data provider - #{@name}: starting ...")
    Process.send_after(self(), :refresh, 500)
    Process.send_after(self(), :presence, @refresh_presence_interval)
    {:ok, state}
  end

  @impl true
  def handle_cast(:broadcast, state) do
    ProgRadioApiWeb.Endpoint.broadcast!(@name, "playing", state)
    {:noreply, state}
  end

  @impl true
  def handle_info(:refresh, _state) do
    data = get_data()
    song = get_song(data)

    ProgRadioApiWeb.Endpoint.broadcast!(@name, "playing", song)

    next_refresh =
      case data do
        nil ->
          Process.send_after(self(), :refresh, @refresh_song_interval)
          @refresh_song_interval

        _ ->
          now_unix =
            DateTime.utc_now()
            |> DateTime.to_unix()

          refresh =
            abs(
              Map.get(data, "next_refresh", now_unix + @refresh_song_interval / 1000) + 2 -
                now_unix
            ) * 1000

          Process.send_after(self(), :refresh, refresh)
          refresh
      end

    Logger.info(
      "Data provider - #{@name}: song updated, next update in #{trunc(next_refresh / 1000)} seconds"
    )

    {:noreply, song}
  end

  @impl true
  def handle_info(:presence, state) do
    how_many_connected =
      Presence.list(@name)
      |> Kernel.map_size()

    case how_many_connected do
      0 ->
        Logger.info("Data provider - #{@name}: no client connected, exiting")
        {:stop, :normal, nil}

      _ ->
        Logger.debug("Data provider - #{@name}: #{how_many_connected} clients connected")

        Process.send_after(self(), :presence, @refresh_presence_interval)
        {:noreply, state}
    end
  end

  # ----- Internal -----

  @spec get_data() :: map() | nil
  defp get_data() do
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

  @spec get_song(map() | nil) :: map()
  defp get_song(data) do
    case data do
      nil ->
        Logger.error("Data provider - #{@name}: error fetching song data")
        %{}

      _ ->
        %{interpreter: data["playing_item"]["title"], title: data["playing_item"]["subtitle"]}
    end
  end
end
