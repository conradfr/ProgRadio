defmodule ProgRadioApi.SongProvider.Hls do
  require Logger
  alias ProgRadioApi.SongProvider
  alias ProgRadioApi.TaskSupervisor

  @behaviour ProgRadioApi.SongProvider

  @refresh_auto_interval 10000

  @task_timeout 7500

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_auto_refresh(), do: @refresh_auto_interval

  @impl true
  def get_data(name, _last_data) do
    url = SongProvider.get_stream_code_name_from_channel(name)

    try do
      task =
        Task.Supervisor.async(TaskSupervisor, fn ->
          try do
            get_hls_data(url)
          rescue
            reason ->
              Logger.error(
                "Data provider - #{name} (hls): task error rescue (#{inspect(reason)})"
              )

              :error
          catch
            :exit, _ ->
              Logger.error("Data provider - #{name} (hls): task error catch")
              :error
          end
        end)

      Task.await(task, @task_timeout)
    rescue
      _ ->
        Logger.error("Data provider - #{name} (hls: data error rescue")
        :error
    end
  end

  @impl true
  def get_song(_name, :error), do: nil

  @impl true
  def get_song(name, data) do
    try do
      data
      |> Map.get(:lines, %{})
      |> Enum.filter(fn line ->
        line.tag_name == "EXTINF"
      end)
      |> Enum.find_value(%{}, fn line ->
        case extract_info(line.value) do
          %{} = artist_title when map_size(artist_title) > 0 ->
            case Map.get(artist_title, "artist", "") do
              "" -> %{artist: Map.get(artist_title, "title")}
              _ -> artist_title
            end

          _ ->
            false
        end
      end)
    rescue
      reason ->
        Logger.error("Data provider - #{name} (hls): task error rescue (#{inspect(reason)})")
        :error
    catch
      :exit, _ ->
        Logger.error("Data provider - #{name} (hls): task error catch")
        :error
    end
  end

  # ---------- INTERNAL ----------

  defp extract_info(value) do
    patterns = [
      # Format with artist - title (generic alphanumeric extraction)
      ~r/^[\d.]+,(?<artist>(?![^,]*=)[^,]+)/,

      # Format with quoted title and optional artist
      ~r/^[\d.]+,(?:title="(?<title>(?:[^"\\]|\-\\.)*)")?,?(?:artist="(?<artist>(?:[^"\\]|\\.)*)")?/
    ]

    Enum.find_value(patterns, %{}, fn pattern ->
      case Regex.named_captures(pattern, value) do
        %{} = captures when map_size(captures) > 0 ->
          # Clean up captures, removing nil or empty strings
          captures
          |> Enum.filter(fn {_, v} -> v != nil and v != "" end)
          |> Enum.into(%{})

        _ ->
          nil
      end
    end)
  end

  defp get_hls_data(url, original_url \\ nil) do
    data =
      url
      |> Req.get!(redirect: true, connect_options: [timeout: 15_000])
      |> Map.get(:body)
      |> HLS.parse()

    case Map.get(data, :type) do
      :master ->
        next_url =
          data
          |> Map.get(:lines, %{})
          |> Enum.find(%{}, fn line ->
            case URI.new(line.value) do
              {:ok, _} ->
                if String.contains?(line.value, ".m3u8"), do: true, else: false

              _ ->
                false
            end
          end)
          |> Map.get(:value)

        case next_url do
          _ when is_binary(next_url) and next_url != "" ->
            next_url
            |> set_full_url_if_needed(original_url || url)
            |> get_hls_data(original_url || url)

          _ ->
            data
        end

      _ ->
        data
    end
  end

  defp set_full_url_if_needed("http" <> _url = full_url, _original_url), do: full_url

  defp set_full_url_if_needed(url, original_url), do: Path.dirname(original_url) <> "/" <> url
end
