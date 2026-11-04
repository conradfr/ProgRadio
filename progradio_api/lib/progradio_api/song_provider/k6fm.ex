defmodule ProgRadioApi.SongProvider.K6fm do
  alias ProgRadioApi.SongProvider.GenericLesIndesEvent

  @behaviour ProgRadioApi.SongProviderPush

  @stream_ids %{
    "k6fm_dijon" => "2174546520932614427",
    "k6fm_beaune" => "2174546520932614427",
    "k6fm_talents" => "3220136225736368254"
  }

  @impl true
  def get_push_client_pid(name) do
    try do
      GenericLesIndesEvent.get_push_client_pid(
        "https://www.k6fm.com/ws/metas?id=",
        name,
        @stream_ids
      )
    rescue
      _ -> :error
    end
  end

  @impl true
  defdelegate get_data(name, push_event, last_data), to: GenericLesIndesEvent

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLesIndesEvent
end
