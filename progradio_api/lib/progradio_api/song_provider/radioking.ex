defmodule ProgRadioApi.SongProvider.Radioking do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @refresh_auto_interval 7500

  @impl true
  def has_custom_refresh(_name), do: true

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
          Logger.debug("Data provider - #{name} (radioking) - next refresh: #{end_nb}")
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
      url =
        if String.contains?(name, "listen.") do
          regex =
            ~r/radio\/(\d+)/

          [_, id] = Regex.run(regex, name)

          "https://www.radioking.com/widgets/api/v1/radio/#{id}/track/current?_=#{SongProvider.now_unix()}"
        else
          regex =
            ~r/(?:https:\/\/play\.radioking\.io\/|https:\/\/www\.radioking\.com\/play\/)([^\/]+)(?:\/\d+)?$/

          [_, id] = Regex.run(regex, name)
          "https://api.radioking.io/widget/radio/#{id}/track/current"
        end

      url
      |> SongProvider.get()
      |> Map.get(:body)
      |> :json.decode()
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (radioking): data error rescue")
        :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      Logger.debug("Data provider - #{name} (radioking): data")

      %{
        artist: SongProvider.recase(data["artist"] || nil),
        title: SongProvider.recase(data["title"] || nil),
        cover_url: data["cover"] || nil
      }
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (radioking): song error rescue")
        :error
    end
  end
end
