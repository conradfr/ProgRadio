defmodule ProgRadioApi.Schedules do
  @moduledoc """
  The Schedule context.
  """

  alias ProgRadioApi.{Radio, SubRadio}

  @queue_schedule_one_prefix "schedule_input:one:"
  @queue_schedule_one_ttl 172_800
  @queue_list "schedule_input:queue"

  @doc """
  Creates a schedule.

  Json struct:
  {
    'radio': code_name,
    'date': date iso,
    'items': [schedule_entries]
  }
  """
  def add_schedule_to_queue(%Radio{} = radio, %SubRadio{} = sub_radio, %{} = data) do
    with valid when valid == true <-
           Enum.all?(["radio", "date", "items"], &Map.has_key?(data, &1)) do
      redis_key = @queue_schedule_one_prefix <> radio.code_name <> "-" <> sub_radio.code_name
      Redix.command!(:redix, ["SETEX", redis_key, @queue_schedule_one_ttl, Jason.encode!(data)])
      Redix.command!(:redix, ["LREM", @queue_list, 1, redis_key])
      Redix.command!(:redix, ["RPUSH", @queue_list, redis_key])
      :ok
    else
      _ -> :error
    end
  end
end
