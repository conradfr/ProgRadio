defmodule ProgRadioApi.SongProvider.GenericLesIndes2 do
  require Logger
  alias ProgRadioApi.SongProvider

  # 5mn
  @minutes_max 300

  def has_custom_refresh(), do: false

  def get_refresh(_name, _data, _default_refresh), do: nil

  def get_data(url, name, %{} = radio_id) do
    radio_id =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(radio_id, &1)).()

    get_data(url, name, radio_id)
  end

  def get_data(url, _name, radio_id) when is_binary(radio_id) do
    now_unix = SongProvider.now_unix()
    now_iso = SongProvider.now_iso()

    try do
      SongProvider.post(
        url,
        %{
          operationName: "TitleDiffusions",
          variables: %{radioStreamId: radio_id, date: now_iso, size: 3},
          query: """
              query TitleDiffusions($size: Int!, $radioStreamId: String!, $date: DateTime!)
              {TitleDiffusions(size: $size, radioStreamId: $radioStreamId, date: $date) {
              id
              timestamp
              title {
                id
                title
                artist
              }
            }}
          """
        }
        |> Jason.encode!()
      )
      |> Map.get(:body)
      |> Jason.decode!()
      |> Map.get("data")
      |> Map.get("TitleDiffusions")
      |> Enum.find(nil, fn e ->
        try do
          {:ok, time_start, _} =
            e
            |> Map.get("timestamp")
            |> DateTime.from_iso8601()

          time_start_iso = DateTime.to_unix(time_start)

          # We don't have the end time so we put a time limit to check against
          time_end = time_start_iso + @minutes_max
          now_unix >= time_start_iso and now_unix <= time_end
        rescue
          _ -> false
        end
      end)
    rescue
      _ -> :error
    end
  end

  def get_song(name, data, _last_song) do
    try do
      %{
        artist: SongProvider.recase(data["title"]["artist"]),
        title: SongProvider.recase(data["title"]["title"])
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
