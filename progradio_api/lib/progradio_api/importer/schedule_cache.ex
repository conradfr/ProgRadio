defmodule ProgRadioApi.Importer.ScheduleCache do
  @moduledoc """
  This manages schedule cache in Redis.
  This is a bit legacy as the cache in the api is now done in ETS but schedule cache on Redis but
    non-spa parts of the website still uses it.
  """

  require Logger
  alias ProgRadioApi.Repo
  alias ProgRadioApi.Radio

  # The Symfony "cache.schedule" pool has a fixed namespace (config/services.yaml) and its RedisAdapter
  # stores keys as "<namespace>:<key>", so the full keys are known: no KEYS scan of the whole database
  @cache_namespace "schedule:"
  @cache_schedule_day_format "%Y-%m-%d"

  @doc """
  Remove cache entries containing this specific radio: full schedule, collection, radio & sub radio
  (keys built like ScheduleManager::getKey() in the Symfony app)
  """
  @spec remove(Date.t() | any, String.t() | any, String.t() | nil) :: tuple
  def remove(date, radio_name, stream_code_name \\ nil)

  def remove(date, radio_name, _stream_code_name) when date == nil or radio_name == nil do
    {:ok, 0}
  end

  def remove(date, radio_name, stream_code_name) do
    radio =
      Repo.get_by(Radio, code_name: radio_name)
      |> Repo.preload([:collection])

    keys =
      [
        get_key(date),
        get_key(date, radio.collection.code_name),
        get_key(date, radio_name),
        stream_code_name && get_key(date, radio_name <> "_" <> stream_code_name)
      ]
      |> Enum.reject(&is_nil/1)
      |> Enum.map(&(@cache_namespace <> &1))

    case Redix.command(:redix, ["DEL" | keys]) do
      {:ok, num} ->
        Logger.debug("Redis cache: #{num} entries deleted")
        {:ok, num}

      {:error, _reason} ->
        {:ok, 0}
    end
  end

  @spec get_key(Date.t(), String.t() | nil) :: String.t()
  defp get_key(date, suffix \\ nil)

  defp get_key(date, suffix) when suffix == nil or suffix == "" do
    Calendar.strftime(date, @cache_schedule_day_format)
  end

  defp get_key(date, suffix) do
    get_key(date) <> "_" <> suffix
  end
end
