defmodule ProgRadioApi.SongProvider.Icecast do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @refresh_auto_interval 30000

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
      # We put it in a task to try to countering hackney increasing clients (ghost process ?)
      task =
        Task.async(fn ->
          try do
            {:ok, %Shoutcast.Meta{data: data}} = Shoutcast.read_meta(url, follow_redirect: true)
            data
          rescue
            _ ->
              :error
          end
        end)

      Task.await(task)
    catch
      :exit, _ ->
        :error
    end
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
        song =
          data
          |> Map.get("StreamTitle", "")
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
end
