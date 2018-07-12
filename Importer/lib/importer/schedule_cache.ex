defmodule Importer.ScheduleCache do

  require Logger
  use Timex

  @cache_schedule_prefix "cache:schedule:"
  @cache_schedule_day_format "%Y-%m-%d"

  @spec remove(any, any) :: tuple
  def remove(date, radio)

  def remove(date, radio) when date == nil or radio == nil do
    {:ok, 0}
  end

  def remove(date, radio) do
    del_num =
      case Redix.command(:redix, ["HDEL", get_key(date), [radio]]) do
        {:ok, num} -> num
        {:error, reason} ->
            Logger.warn("#{inspect(reason)}")
            0
      end

    {:ok, del_num}
  end

  defp get_key(date) do
    @cache_schedule_prefix <> Timex.format!(date, @cache_schedule_day_format, :strftime)
  end
end
