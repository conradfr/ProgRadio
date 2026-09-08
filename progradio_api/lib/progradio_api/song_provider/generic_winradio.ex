defmodule ProgRadioApi.SongProvider.GenericWinradio do
  require Logger
  alias ProgRadioApi.SongProvider

  # 5mn
  @max_length_seconds 300

  def has_custom_refresh(_name), do: false

  def get_refresh(_name, _data, _default_refresh), do: nil

  def get_data(url, name, %{} = radio_ids, last_data) do
    radio_id =
      name
      |> SongProvider.get_stream_code_name_from_channel()
      |> SongProvider.get_id_from_list(radio_ids)

    get_data("#{url}#{radio_id}.xml", name, last_data)
  end

  def get_data(url, name, _last_data) do
    now_unix = SongProvider.now_unix()

    try do
      (url <> "?=#{now_unix}")
      |> SongProvider.get()
      |> XmlToMap.naive_map()
      |> Map.get("prog", %{})
      |> Map.get("morceau", [])
      |> Enum.find(nil, fn e ->
        try do
          time_start =
            e
            |> Map.get("#content", %{})
            |> Map.get("date_prog")
            |> NaiveDateTime.from_iso8601!()
            |> DateTime.from_naive!("Europe/Paris")
            |> DateTime.to_unix()

          #        {duration, _} =
          #          e
          #          |> Map.get("#content", %{})
          #          |> Map.get("duration")
          #          |> Time.from_iso8601!()
          #          |> Time.to_seconds_after_midnight()
          #
          #        time_end = time_start + duration
          time_end = time_start + @max_length_seconds
          now_unix >= time_start and now_unix <= time_end
        rescue
          _ -> nil
        end
      end)
    rescue
      _ ->
        Logger.error("Data provider - #{name}: data error rescue")
        :error
    catch
      :error, _reason ->
        :error

      :exit, _ ->
        [:error, nil]
    end
  end

  def get_song(name, data, _last_song) do
    try do
      content = Map.get(data, "#content")

      %{
        artist: SongProvider.recase(content["chanteur"]),
        title: SongProvider.recase(content["chanson"] || nil),
        cover_url: Map.get(content, "pochette")
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end
end
