defmodule ProgRadioApi.SongProvider.Lautfm do
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
        |> Map.get("ends_at")
        |> DateTime.from_iso8601()

      end_unix = DateTime.to_unix(end_at)

      case end_unix - now_unix do
        end_nb when end_nb <= 0 ->
          @refresh_auto_interval

        end_nb ->
          Logger.debug("Data provider - #{name} (laut.fm) - next refresh: #{end_nb}")
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
        ~r{laut\.fm/([a-zA-Z0-9_-]+)$}

      [_, id] = Regex.run(regex, name)

      case id do
        nil ->
          nil

        _ ->
          "https://api.laut.fm/station/#{id}/current_song"
          |> SongProvider.get()
          |> Map.get(:body)
          |> :json.decode()
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (laut.fm): data error rescue")
        :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      Logger.debug("Data provider - #{name} (laut.fm): data")

      %{
        artist: SongProvider.recase(data["artist"]["name"] || nil),
        title: SongProvider.recase(data["title"] || nil),
      }
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (laut.fm): song error rescue")
        :error
    end
  end
end
