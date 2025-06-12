defmodule ProgRadioApi.SongProvider.Zeno do
  require Logger

  @behaviour ProgRadioApi.SongProviderPush

  @impl true
  def get_push_client_pid(name) do
    try do
      regex = ~r/.zeno.fm\/([a-z0-9]+)/
      [_, id] = Regex.run(regex, name)

      EventsourceEx.new("https://api.zeno.fm/mounts/metadata/subscribe/" <> id, stream_to: self())
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (zeno): create sse client error")
        :error
    end
  end

  @impl true
  def get_data(name, %EventsourceEx.Message{} = push_event, last_data) do
    try do
      push_event.data
      |> :json.decode()
    rescue
      _ ->
        Logger.error("Data provider - #{name}: push event error")
        last_data
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      case data do
        nil ->
          nil

        data when is_map_key(data, "streamTitle") ->
          song = Map.get(data, "streamTitle")
          # we discard empty or suspicious/incomplete entries
          if is_binary(song) == false or song === "" or song === "-" or song === " - " do
            nil
          else
            %{
              artist: song,
              title: nil
            }
          end

        _ ->
          nil
      end
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
