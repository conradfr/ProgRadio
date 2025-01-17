defmodule ProgRadioApi.SongProvider.Rcast do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @refresh_auto_interval 20000

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
        Logger.error("Data provider - #{name} (icecast): data error rescue")
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

      text when text == "Unknown Track" ->
        %{}

      text when text == "" ->
        %{}

      text ->
        Logger.debug("Data provider - #{name}: data - #{text}")

        %{
          artist: text,
          title: nil
        }
    end
  end
end
