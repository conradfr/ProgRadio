defmodule ProgRadioApi.SongProvider.Radioking do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @refresh_auto_interval 10000

  @impl true
  def has_custom_refresh(), do: true

  @impl true
  def get_refresh(name, data, _default_refresh) do
    try do
      now_unix = SongProvider.now_unix()

      {:ok, end_at, _} =
        data
        |> Map.get("end_at")
        |> DateTime.from_iso8601()

      end_unix = DateTime.to_unix(end_at)

      case end_unix - now_unix do
        end_nb when end_nb <= 0 ->
          @refresh_auto_interval

        end_nb ->
          Logger.debug("Data provider - #{name} - next refresh: #{end_nb}")
          end_nb * 1000
      end
    rescue
      _ -> @refresh_auto_interval
    end
  end

  @impl true
  def get_auto_refresh(), do: @refresh_auto_interval

  @impl true
  def get_data(name, _last_data) do
    try do
      regex =
        ~r/(?:https:\/\/play\.radioking\.io\/|https:\/\/www\.radioking\.com\/play\/)([^\/]+)(?:\/\d+)?$/

      [_, id] = Regex.run(regex, name)

      case id do
        nil ->
          nil

        _ ->
          "https://api.radioking.io/widget/radio/#{id}/track/current"
          |> SongProvider.get()
          |> Map.get(:body)
          |> Jason.decode!()
      end
    rescue
      _ ->
        Logger.error("Data provider - #{name} (radioking): data error rescue")
        :error
    end
  end

  @impl true
  def get_song(_name, :error), do: nil

  @impl true
  def get_song(name, data) do
    case data do
      nil ->
        Logger.info("Data provider - #{name}: error fetching song data or empty")
        %{}

      _ ->
        Logger.debug("Data provider - #{name} - data")

        %{
          artist: SongProvider.recase(data["artist"] || nil),
          title: SongProvider.recase(data["title"] || nil)
        }
    end
  end
end
