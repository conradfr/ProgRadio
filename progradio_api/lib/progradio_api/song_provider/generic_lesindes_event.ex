defmodule ProgRadioApi.SongProvider.GenericLesIndesEvent do
  require Logger

  alias ProgRadioApi.SongProvider

  def get_push_client_pid(url, name, %{} = stream_ids) do
    stream_id =
      name
      |> SongProvider.get_stream_code_name_from_channel()
      |> SongProvider.get_id_from_list(stream_ids)

    get_push_client_pid(url, name, stream_id)
  end

  def get_push_client_pid(url, name, stream_id) when is_binary(stream_id) do
    try do
      EventsourceEx.new(url <> stream_id, stream_to: self())
    rescue
      _ ->
        Logger.debug("Data provider - #{name}: create sse client error")
        :error
    end
  end

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
