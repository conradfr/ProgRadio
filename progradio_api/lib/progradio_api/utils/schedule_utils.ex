defmodule ProgRadioApi.Utils.ScheduleUtils do
  # match the microsecond precision of the DB values (e.g. 2026-07-06T22:00:00.000000Z)
  def with_microseconds(%DateTime{microsecond: {value, _precision}} = date_time),
    do: %{date_time | microsecond: {value, 6}}
end
