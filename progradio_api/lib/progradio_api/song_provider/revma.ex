defmodule ProgRadioApi.SongProvider.Revma do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @impl true
  def has_custom_refresh(_name), do: true

  @impl true
  def get_refresh(_name, nil, default_refresh), do: default_refresh

  @impl true
  def get_refresh(_name, data, default_refresh) do
    try do
      now_unix = SongProvider.now_unix() * 1000
      end_unix = Map.get(data, "endTime", 0)

      case end_unix - now_unix do
        next_refresh
        when next_refresh > 0 ->
          next_refresh + 500

        _ ->
          default_refresh
      end
    rescue
      _ -> default_refresh
    end
  end

  @impl true
  def get_data(name, _last_data) do
    try do
      regex = ~r/revma\..*\/zc(\d+)/

      [_, stream_number] = Regex.run(regex, name)

      case stream_number do
        nil ->
          nil

        _ ->
          data =
            "https://us.api.iheart.com/api/v3/live-meta/stream/#{stream_number}/currentTrackMeta?defaultMetadata=true"
            |> SongProvider.get()

          data =
            case data do
              "" -> %{}
              _ -> JSON.decode!(data)
            end

          now_unix = SongProvider.now_unix() * 1000
          time_start = Map.get(data, "startTime")
          time_end = Map.get(data, "endTime")

          cond do
            is_nil(time_start) and is_nil(time_end) -> data
            time_start != nil and now_unix < time_start -> nil
            time_end != nil and now_unix > time_end -> nil
            true -> data
          end
      end
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (revma): data error rescue")
        :error
    catch
      :error, reason ->
        Logger.debug("Data provider - #{name} (revma): caught error #{inspect(reason)}")
        :error

      {:error, reason} ->
        Logger.debug("Data provider - #{name} (revma): caught error #{inspect(reason)}")
        :error

      :exit, _ ->
        Logger.debug("Data provider - #{name} (revma): data error catch")
        [:error, nil]
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      %{
        artist: Map.get(data, "artist"),
        title: Map.get(data, "title"),
        cover_url: Map.get(data, "imagePath")
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
