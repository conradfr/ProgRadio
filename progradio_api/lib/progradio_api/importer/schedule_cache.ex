defmodule ProgRadioApi.Importer.ScheduleCache do
  @moduledoc """
  This manages schedule cache in Redis.
  This is a bit legacy as the cache in the api is now done in ETS but schedule cache on Redis but
    non-spa parts of the website still uses it.
  """

  require Logger
  use Timex
  alias ProgRadioApi.Repo
  alias ProgRadioApi.Radio

  @cache_schedule_prefix "cache_schedule_"
  @cache_schedule_day_format "%Y-%m-%d"

  @doc """
  Remove cache entries containing this specific radio: full schedule, collection & radio
  """
  @spec remove(Date.t() | any, String.t() | any) :: tuple
  def remove(date, radio_name)

  def remove(date, radio_name) when date == nil or radio_name == nil do
    {:ok, 0}
  end

  def remove(date, radio_name) do
    radio =
      Repo.get_by(Radio, code_name: radio_name)
      |> Repo.preload([:collection])

    keys_deleted_sum =
      [
        get_key(date),
        get_key(date, radio_name),
        get_key(date, radio.collection.code_name)
      ]
      |> Enum.reduce(0, fn key, acc ->
        case find_cache_key(key) do
          nil ->
            acc

          cache_key ->
            case Redix.command(:redix, ["DEL", cache_key]) do
              {:ok, num} ->
                Logger.debug("Redis cache: #{num} entries deleted")
                acc + num

              {:error, _reason} ->
                acc
            end
        end
      end)

    {:ok, keys_deleted_sum}
  end

  @spec get_key(Date.t(), String.t()) :: String.t()
  defp get_key(date, suffix \\ nil)

  defp get_key(date, suffix) when suffix == nil or suffix == "" do
    @cache_schedule_prefix <> Timex.format!(date, @cache_schedule_day_format, :strftime)
  end

  defp get_key(date, suffix) do
    get_key(date) <> "_" <> suffix
  end

  # As we rely on the Symfony cache we don't know the full keys because of the calculated namespace,
  # So we look it up here based on the rest of the key
  @spec find_cache_key(String.t()) :: String.t() | nil
  defp find_cache_key(pattern) do
    {:ok, keys} = Redix.command(:redix, ["KEYS", "*:" <> pattern <> "*"])

    case Kernel.length(keys) do
      0 -> nil
      _ -> List.first(keys)
    end
  end
end
