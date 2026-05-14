defmodule ProgRadioApi.SongProvider.Kizrock do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "kizrock_metal" => "https://kizrock.com/?qtproxycall=https%3A%2F%2Fgo.2stream.net%2Fkizrock_metal&icymetadata=1&_=",
    "kizrock_rock" => "https://kizrock.com/?qtproxycall=https%3A%2F%2Fgo.2stream.net%2Fkizrock&icymetadata=1&_="
  }

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    now_unix = SongProvider.now_unix()

    url =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()

    try do
      "#{url}#{now_unix}"
      |> SongProvider.get()
    rescue
      _ -> :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      case data do
        "" -> nil
        data when is_binary(data) -> %{artist: data, title: nil}
        _ -> nil
      end
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
