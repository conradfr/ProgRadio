defmodule Importer.ScheduleCache do
  require Logger
  use Timex

  @cache_schedule_prefix "cache:schedule:"
  @cache_schedule_day_format "%Y-%m-%d"

  @spec remove(Date.t() | any, String.t() | any) :: tuple
  def remove(date, radio_name)

  def remove(date, radio_name) when date == nil or radio_name == nil do
    {:ok, 0}
  end

  def remove(date, radio_name) do
    del_num =
      case Redix.command(:redix, ["HDEL", get_key(date), [radio_name]]) do
        {:ok, num} ->
          num

        {:error, reason} ->
          Logger.warn("#{inspect(reason)}")
          0
      end

    {:ok, del_num}
  end

  @spec get_key(Date.t()) :: String.t()
  defp get_key(date) do
    @cache_schedule_prefix <> Timex.format!(date, @cache_schedule_day_format, :strftime)
  end
end
