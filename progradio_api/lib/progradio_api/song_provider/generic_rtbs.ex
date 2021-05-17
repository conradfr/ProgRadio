defmodule ProgRadioApi.SongProvider.GenericRtbs do
  require Logger
  alias ProgRadioApi.SongProvider

  def has_custom_refresh(), do: true

  def get_refresh(_name, nil, default_refresh), do: default_refresh

  def get_refresh(_name, data, default_refresh) do
    now_unix = SongProvider.now_unix()

    end_unix =
      data
      |> Map.get("stopTime", "0")
      |> String.to_integer()

    next = end_unix - now_unix

    unless next < 1 do
      next * 1000
    else
      default_refresh
    end
  end

  def get_data(id, _name, _last_data) do
    now_unix = SongProvider.now_unix()

    try do
      data =
        HTTPoison.get!(
          "https://np.maradio.be/qp/v3/events?rpId=#{id}&nameSize=100000&serviceNameSize=100000&artistNameSize=100000&descriptionSize=100000&_=#{
            now_unix
          }",
          [],
          ssl: [ciphers: :ssl.cipher_suites(), versions: [:"tlsv1.2", :"tlsv1.1", :tlsv1]]
        )
        |> Map.get(:body)
        |> Jason.decode!()
        |> Map.get("results")
        |> Map.get("now")

      end_time =
        data
        |> Map.get("stopTime", "0")
        |> String.to_integer()

      unless Map.get(data, "song", false) == false or now_unix > end_time do
        data
      else
        nil
      end
    rescue
      _ -> nil
    end
  end

  def get_song(name, data) do
    case data do
      nil ->
        Logger.info("Data provider - #{name}: error fetching song data or empty")
        %{}

      _ ->
        %{
          artist: SongProvider.recase(data["artistName"]),
          title: SongProvider.recase(data["name"])
        }
    end
  end
end
