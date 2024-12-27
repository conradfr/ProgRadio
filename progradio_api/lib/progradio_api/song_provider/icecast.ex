defmodule ProgRadioApi.SongProvider.Icecast do
  require Logger
  alias ProgRadioApi.SongProvider
  alias ProgRadioApi.TaskSupervisor

  @behaviour ProgRadioApi.SongProvider

  @refresh_auto_interval 10000

  @task_timeout 7500

  #  @icecast_api "/status-json.xsl"

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_auto_refresh(), do: @refresh_auto_interval

  @impl true
  def get_data(name, _last_data) do
    url = SongProvider.get_stream_code_name_from_channel(name)

    #    data =
    #      case is_map(last_data) do
    #        true when is_map_key(last_data, :json) == true and last_data.json === true ->
    #          get_json_data(url)
    #
    #        true ->
    #          nil
    #
    #        _ ->
    #          get_json_data(url)
    #      end
    #
    #    case data do
    #      %{} ->
    #        Map.put(data, :json, true)
    #
    #      _ ->
    try do
      task =
        Task.Supervisor.async(TaskSupervisor, fn ->
          try do
            {:ok, %Shoutcast.Meta{data: data}} =
              Shoutcast.read_meta(url, follow_redirect: true, pool: false)

            data
          rescue
            reason ->
              Logger.error("Data provider - #{name}: task error rescue (#{inspect(reason)})")
              :error
          catch
            :exit, _ ->
              Logger.error("Data provider - #{name}: task error catch")
              :error
          end
        end)

      Task.await(task, @task_timeout)
    rescue
      _ ->
        Logger.error("Data provider - #{name} (icecast): data error rescue")
        :error
    end

    #    end
  end

  @impl true
  def get_song(_name, :error), do: nil

  @impl true
  def get_song(name, data) do
    case data do
      nil ->
        Logger.info("Data provider - #{name}: error fetching song data or empty")
        %{}

      _ ->
        key =
          if is_map_key(data, :json) and data.json == true, do: "title", else: "StreamTitle"

        song =
          data
          |> Map.get(key, "")
          |> then(fn
            text when is_binary(text) ->
              Enum.join(for <<c::utf8 <- text>>, do: <<c::utf8>>)

            text when is_list(text) ->
              to_string(text)

            text ->
              text
          end)
          |> String.trim()

        Logger.debug("Data provider - #{name}: data - #{song}")

        # we discard empty or suspicious/incomplete entries
        unless is_binary(song) == false or song === "" or song === "-" or
                 String.contains?(song, " - ") === false do
          %{
            artist: song,
            title: nil
          }
        else
          %{}
        end
    end
  end

  #  defp get_json_data(stream_url) do
  #    parsed_url = URI.parse(stream_url)
  #
  #    base_url =
  #      "#{parsed_url.scheme}://#{parsed_url.host}#{if parsed_url.port, do: ":#{parsed_url.port}", else: ""}"
  #
  #    try do
  #      "#{base_url}#{@icecast_api}"
  #      |> SongProvider.get()
  #      |> Map.get(:body)
  #      |> Jason.decode!()
  #      |> Map.get("icestats")
  #      |> Map.get("source")
  #      |> Enum.find(fn s ->
  #        String.contains?(s["listenurl"], parsed_url.host) == true and
  #          String.contains?(s["listenurl"], parsed_url.path || "") == true
  #      end)
  #    rescue
  #      _ -> nil
  #    end
  #  end
end
