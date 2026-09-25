defmodule ProgRadioApi.SongProvider.Securenetsystems do
  require Logger
  alias ProgRadioApi.SongProvider
  alias ProgRadioApi.Utils.ReqUtils

  @behaviour ProgRadioApi.SongProvider

  @server_numbers 2..9
  @regex ~r|//[^/]+\.securenetsystems\.net/(?:cirrusencore/)?(?<id>[A-Z]{4})/?(?:\?.*)?$|

  # we may do up to 8 requests in a row and the caller gives us 15s (@task_timeout)
  @timeout 1_500

  # ex: "06 Sep 2026 06:49:45" - no timezone is given, we assume UTC
  @date_regex ~r/^(?<day>\d{1,2}) (?<month>[A-Za-z]{3}) (?<year>\d{4}) (?<hour>\d{1,2}):(?<minute>\d{2}):(?<second>\d{2})$/

  @months %{
    "Jan" => 1,
    "Feb" => 2,
    "Mar" => 3,
    "Apr" => 4,
    "May" => 5,
    "Jun" => 6,
    "Jul" => 7,
    "Aug" => 8,
    "Sep" => 9,
    "Oct" => 10,
    "Nov" => 11,
    "Dec" => 12
  }

  # above that the data is bogus (wrong timezone?), we use the default refresh
  @max_refresh 1_800_000

  @impl true
  def has_custom_refresh(_name), do: true

  @impl true
  def get_refresh(name, {:found, _station_id, _server_number, last_data}, default_refresh)
      when is_map(last_data) do
    # the program ends at <programStartTS> + <duration>, we refresh one second later
    with start_unix when is_integer(start_unix) <-
           parse_start(Map.get(last_data, "programStartTS")),
         duration when is_integer(duration) <- parse_duration(Map.get(last_data, "duration")),
         refresh when refresh > 0 and refresh <= @max_refresh <-
           (start_unix + duration + 1 - SongProvider.now_unix()) * 1000 do
      Logger.debug(
        "Data provider - #{name} (securenetsystems) - next refresh: #{trunc(refresh / 1000)} seconds"
      )

      refresh
    else
      _ -> default_refresh
    end
  end

  @impl true
  def get_refresh(_name, _data, default_refresh), do: default_refresh

  # server found on previous run
  @impl true
  def get_data(name, {:found, station_id, server_number, _last_data}) do
    try do
      {:found, station_id, server_number, get_playlist(station_id, server_number)}
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (securenetsystems): data error rescue")
        {:found, station_id, server_number, nil}
    catch
      :exit, _ ->
        {:found, station_id, server_number, nil}
    end
  end

  # server not found on previous run, default to icecast
  @impl true
  def get_data(name, {:not_found, url, last_data}) do
    {_type, final_url, data} =
      ProgRadioApi.SongProvider.Icecast.get_data(name, {:default, url, last_data})

    {:not_found, final_url, data}
  end

  @impl true
  def get_data(name, _last_data) do
    try do
      %{"id" => station_id} = Regex.named_captures(@regex, name)
      url = SongProvider.get_stream_code_name_from_channel(name)

      Enum.reduce_while(@server_numbers, {:not_found, url, nil}, fn server_number, acc ->
        case get_playlist(station_id, server_number) do
          nil ->
            {:cont, acc}

          playlist ->
            Logger.debug("Data provider - #{name} (securenetsystems): found on #{server_number}")
            {:halt, {:found, station_id, server_number, playlist}}
        end
      end)
    rescue
      _ ->
        Logger.debug("Data provider - #{name} (securenetsystems): data error rescue")
        :error
    catch
      :exit, _ ->
        :error
    end
  end

  @impl true
  def get_song(name, {:not_found, url, data}, last_song) do
    ProgRadioApi.SongProvider.Icecast.get_song(name, {:default, url, data}, last_song)
  end

  @impl true
  def get_song(name, {:found, _station_id, _server_number, data}, _last_song) do
    try do
      %{
        artist: SongProvider.recase(data["artist"]),
        title: SongProvider.recase(data["title"]),
        cover_url: data["cover"] || nil
      }
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end

  # ---------- internal ----------

  defp parse_start(value) when is_binary(value) do
    with %{"month" => month_name} = parts <- Regex.named_captures(@date_regex, String.trim(value)),
         month when is_integer(month) <- Map.get(@months, month_name),
         {:ok, naive} <-
           NaiveDateTime.new(
             String.to_integer(parts["year"]),
             month,
             String.to_integer(parts["day"]),
             String.to_integer(parts["hour"]),
             String.to_integer(parts["minute"]),
             String.to_integer(parts["second"])
           ) do
      naive
      |> DateTime.from_naive!("Etc/UTC")
      |> DateTime.to_unix()
    else
      _ -> nil
    end
  end

  defp parse_start(_value), do: nil

  defp parse_duration(value) when is_integer(value), do: value

  defp parse_duration(value) when is_binary(value) do
    case Integer.parse(String.trim(value)) do
      {duration, _rest} -> duration
      :error -> nil
    end
  end

  defp parse_duration(_value), do: nil

  # the wrong server answers with an html error page, so we only trust an xml one
  defp get_playlist(station_id, server_number) do
    url =
      "https://streamdb#{server_number}web.securenetsystems.net/player_status_update/#{station_id}.xml?randStr=#{SongProvider.now_unix()}"

    try do
      case request(url) do
        %Req.Response{status: 200, headers: %{"content-type" => ["text/xml" <> _]}} = response ->
          response
          |> Map.get(:body)
          |> XmlToMap.naive_map()
          |> Map.get("playlist", %{})

        _ ->
          nil
      end
    rescue
      _ -> nil
    catch
      :exit, _ -> nil
    end
  end

  # same as SongProvider.get/1 but we need the headers, not only the body
  defp request(url) do
    Req.get!(
      url,
      ReqUtils.get_options_for(url,
        retry: false,
        decode_body: false,
        connect_options: [timeout: @timeout],
        receive_timeout: @timeout
      )
    )
  end
end
