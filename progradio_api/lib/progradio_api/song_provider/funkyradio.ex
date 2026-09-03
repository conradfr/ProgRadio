defmodule ProgRadioApi.SongProvider.Funkyradio do
  require Logger
  alias ProgRadioApi.SongProvider

  # deprecated as icecast works for it now
  # kept for reference

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "funkyradio_main" => "https://metadata.streamingmedia.it/title/funky-radio.json",
    "funkyradio_disco" => "https://metadata.streamingmedia.it/title/disco-funk.json"
  }

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    try do
      now_unix = SongProvider.now_unix()

      url =
        name
        |> SongProvider.get_stream_code_name_from_channel()
        |> SongProvider.get_id_from_list(@stream_ids)

      SongProvider.get_json("#{url}?rand=#{:rand.uniform(1000)}&_=#{now_unix}")
    rescue
      _ -> :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      Logger.debug("Data provider - #{name}")

      case data do
        %{"title" => title} ->
          %{
            artist: title,
            title: nil
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
