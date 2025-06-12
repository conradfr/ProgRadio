defmodule ProgRadioApi.SongProvider.Mexside do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    Logger.debug("Data provider - #{name} (mexside): data")

    regex = ~r/url:(.*?)(?:\/stream|\/;)/
    url =
      case Regex.run(regex, name) do
        [_, url] -> url
        _ -> nil
      end

    try do
      url
      |> Kernel.<>("/stats")
      |> SongProvider.get()
      |> Map.get(:body)
      |> XmlToMap.naive_map()
      |> Map.get("SHOUTCASTSERVER", %{})
      |> Map.get("SONGTITLE")
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (mexside): data error rescue")
        :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      Logger.debug("Data provider - #{name} (mexside): song")

      if data != nil and data != :error and is_binary(data) and data != "" do
        %{
          artist: data,
          title: nil,
          cover_url: nil
        }
      else
        nil
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (mexside): song error rescue")
        :error
    end
  end
end
