defmodule ProgRadioApi.SongProvider.Creacast do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    try do
      regex =
        ~r{/([a-zA-Z0-9_-]+)$}

      [_, id] = Regex.run(regex, name)

      case id do
        nil ->
          nil

        _ ->
          "https://www.creacast.com/get_title.php?usr=#{id}&mode=raw"
          |> SongProvider.get()
          |> Map.get(:body)
      end
    rescue
      _ -> :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      # This is just a plain file, will have php errors if error from the server
      if String.contains?(data, "Notice") do
        %{}
      else
        %{
          artist: data,
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
