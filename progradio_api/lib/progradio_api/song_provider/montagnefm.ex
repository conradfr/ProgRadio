defmodule ProgRadioApi.SongProvider.Montagnefm do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(_name, _last_data) do
    try do
      now_unix = SongProvider.now_unix()

      "https://www.montagnefm.com/titrage/txt-1-titre.php?_=#{now_unix}"
      |> SongProvider.get()
    rescue
      _ -> :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      case data do
        _content when is_binary(data) ->
          %{
            artist: data,
            title: nil
          }

        _ -> %{}
      end
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
