defmodule ProgRadioApi.SongProvider.RadioCo do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @refresh_auto_interval 7500

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_auto_refresh(), do: @refresh_auto_interval

  @impl true
  def get_data(name, _last_data) do
    try do
      regex =
        ~r{\.radio\.co/([a-z0-9]+)/}

      [_, id] = Regex.run(regex, name)

      case id do
        nil ->
          nil

        _ ->
          "https://public.radio.co/api/v2/#{id}/track/current"
          |> SongProvider.get()
          |> Map.get(:body)
          |> :json.decode()
          |> Map.get("data")
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (radio.co): data error rescue")
        :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      Logger.debug("Data provider - #{name} (radio.co): data")

      %{
        artist: Map.get(data, "title"),
        title: nil,
        cover_url: Map.get(data, "artwork_urls", %{}) |> Map.get("standard")
      }
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (radio.co): song error rescue")
        :error
    end
  end
end
