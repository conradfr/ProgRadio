defmodule ProgRadioApiWeb.ListeningSessionJSON do
  def one(listening_session) do
    %{
      id: listening_session.id,
      status: "OK",
      date_time_start: listening_session.date_time_start,
      date_time_end: listening_session.date_time_end
    }
  end
end
