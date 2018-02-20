defmodule Importer.ScheduleCache do
  use GenServer

  require Logger
  use Timex

  @name :schedule_cache

  @cache_schedule_prefix "cache:schedule:"
  @cache_schedule_day_format "%Y-%m-%d"

  # ----- Client Interface -----

  def start_link(_arg) do
    Logger.info "Starting the schedule cache ..."
    GenServer.start_link(__MODULE__, :ok, name: @name)
  end

  def remove(date, radio) do
    GenServer.cast @name, {:remove, date, radio}
  end

  # ----- Server callbacks -----

  def init(:ok) do
    {:ok, nil}
  end

  def handle_cast({:remove, date, radio}, _state) when date == nil or radio == nil do
    {:noreply, nil}
  end

  def handle_cast({:remove, date, radio}, _state) do
    case Redix.command(:redix, ["HDEL", get_key(date), [radio]]) do
      {:error, reason} -> Logger.warn "#{inspect(reason)}"
      _ -> :ok
    end

    {:noreply, nil}
  end

  defp get_key(date) do
    @cache_schedule_prefix <> Timex.format!(date, @cache_schedule_day_format, :strftime)
  end
end
