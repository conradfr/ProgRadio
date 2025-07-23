defmodule ProgRadioApi.SongProvider.AirtimePro do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @refresh_auto_interval 10000

  @impl true
  def has_custom_refresh(), do: true

  @impl true
  def get_refresh(name, %{"type" => "track"} = data, _last_song) do
    try do
      now_unix = SongProvider.now_unix()

      end_unix =
        data
        |> Map.get("ends")
        |> NaiveDateTime.from_iso8601!()
        |> DateTime.from_naive!("Etc/UTC")
        |> DateTime.to_unix()

      case end_unix - now_unix do
        end_nb when end_nb <= 0 ->
          @refresh_auto_interval

        end_nb ->
          Logger.debug("Data provider - #{name} (airtime.pro) - next refresh: #{end_nb}")
          end_nb * 1000
      end
    rescue
      _ ->
        @refresh_auto_interval
    end
  end

  def get_refresh(_name, _data, default_refresh), do: default_refresh

  @impl true
  def get_auto_refresh(), do: @refresh_auto_interval

  @impl true
  def get_data(name, _last_data) do
    try do
      regex =
        ~r{\/\/([a-z0-9]+)\.out\.airtime\.pro}

      [_, id] = Regex.run(regex, name)

      case id do
        nil ->
          nil

        _ ->
          "https://#{id}.airtime.pro/api/live-info"
          |> SongProvider.get()
          |> Map.get(:body)
          |> :json.decode()
          |> Map.get("current")
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (airtime.pro): data error rescue")
        :error
    end
  end

  @impl true
  def get_song(name, %{"type" => "track"} = data, _last_song) do
    try do
      Logger.debug("Data provider - #{name} (airtime.pro): data")

      case Map.get(data, "metadata", %{}) |> Map.get("artist_name") do
        artist when is_binary(artist) ->
          %{
            artist: artist,
            title: Map.get(data, "metadata", %{}) |> Map.get("track_title")
          }

        _ ->
          nil
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (airtime.pro): song error rescue")
        :error
    end
  end

  @impl true
  def get_song(_name, _data, _last_song), do: nil
end
