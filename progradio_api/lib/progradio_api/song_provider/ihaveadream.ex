defmodule ProgRadioApi.SongProvider.Ihaveadream do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, default_refresh), do: default_refresh

  @impl true
  def get_data(_name, _last_data) do
    try do
      "https://www.radio-ihaveadream.com/info-radio-live"
      |> SongProvider.get()
      |> Map.get(:body)
      |> :json.decode()
      |> List.first()
    rescue
      _ -> :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      [_, _, artist, title] = data
      %{artist: artist, title: title}
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
