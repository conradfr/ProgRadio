defmodule ProgRadioApi.SongProvider.Rcast do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @refresh_auto_interval 7500

  @rcast_status "https://status.rcast.net/"

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_auto_refresh(), do: @refresh_auto_interval

  @impl true
  def get_data(name, _last_data) do
    try do
      parsed_url = Regex.run(~r/\.rcast\.net\/(\d+)/, name)

      case parsed_url do
        nil ->
          nil

        [_url, id] ->
          (@rcast_status <> id)
          |> SongProvider.get()
          |> Map.get(:body)
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (rcast): data error rescue")
        :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      case data do
        nil ->
          Logger.info("Data provider - #{name} (rcast): error fetching song data or empty")
          %{}

        text when text == "Unknown Track" ->
          %{}

        text when text == "" ->
          %{}

        text ->
          Logger.debug("Data provider - #{name} (rcast): data - #{text}")

          %{
            artist: text,
            title: nil
          }
      end
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
