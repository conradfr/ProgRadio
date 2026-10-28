defmodule ProgRadioApi.SongProvider.K6fm do
  require Logger

  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProviderPush

  @stream_ids %{
    "k6fm_dijon" => "2174546520932614427",
    "k6fm_beaune" => "2174546520932614427",
    "k6fm_talents" => "3220136225736368254",
  }

  @impl true
  def get_push_client_pid(name) do
    try do
      stream_id =
        name
        |> SongProvider.get_stream_code_name_from_channel()
        |> SongProvider.get_id_from_list(@stream_ids)

      EventsourceEx.new("https://www.k6fm.com/ws/metas?id=" <> stream_id, stream_to: self())
    rescue
      _ ->
        Logger.debug("Data provider - #{name}: create sse client error")
        :error
    end
  end

  @impl true
  def get_data(name, %EventsourceEx.Message{} = push_event, last_data) do
    try do
      push_event.data
      |> JSON.decode!()
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

        data when is_map(data) ->
          cover_url =
            case Map.get(data, "coverId") do
              nil ->
                nil

              cover_id when is_binary(cover_id) ->
                "https://www.lesindesradios.fr/servicesimb/images?version=6&iid=#{cover_id}&width=200"

              _ ->
                nil
            end

          %{
            artist: Map.get(data, "artist"),
            title: Map.get(data, "title"),
            cover_url: cover_url
          }

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
