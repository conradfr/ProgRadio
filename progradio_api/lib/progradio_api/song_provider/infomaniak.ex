defmodule ProgRadioApi.SongProvider.Infomaniak do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @refresh_auto_interval 5000
  # 15 mn
  @max_delta_seconds 900

  @forbidden_titles ["Use HTTP to feed the song name", " - "]

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
        ~r/https:\/\/([^\/]+?)\.ice\.infomaniak\.ch/

      [_, id] = Regex.run(regex, name)

      case id do
        nil ->
          nil

        _ ->
          data =
            "https://metadata.infomaniak.com/api/radio/#{id}/metadata"
            |> SongProvider.get()
            |> Map.get(:body)
            |> :json.decode()
            |> Map.get("data")
            |> List.last()

          # over the delta, let's consider it's a not up to date data
          if SongProvider.now_unix() > Map.get(data, "date") + @max_delta_seconds do
            nil
          else
            data
          end
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (infomaniak): data error rescue")
        :error
    end
  end

  @impl true
  def get_song(name, data, last_song) do
    try do
      title =
        data
        |> Map.get("title", "")
        |> String.replace("  -  ", " - ")

      if is_binary(title) and title != "" and Enum.member?(@forbidden_titles, title) == false do
        # sometimes it seems the data of the last entry is only the title of the previous artist - title entry so we use this one instead
        if String.starts_with?(title, " - ") do
          last_song
        else
          %{
            artist: String.replace(title, "  -  ", " - "),
            title: nil
          }
        end
      else
        nil
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (infomaniak): song error rescue")
        %{}
    end
  end
end
