defmodule ProgRadioApi.SongProvider.Metropolys do
  alias ProgRadioApi.SongProvider.GenericLesIndesEvent

  @behaviour ProgRadioApi.SongProviderPush

  @stream_ids %{
    "metropolys_lille" => "2174546520932614668",
    "metropolys_douai" => "2174546520932614668",
    "metropolys_saint_omer" => "2174546520932614668",
    "metropolys_saint_quentin" => "2174546520932614668",
    "metropolys_amiens" => "2174546520932614668",
    "metropolys_metropolys90" => "3316078315535630058",
    "metropolys_dance_classics" => "1017715771149906395",
    "metropolys_disco_funk" => "1017693661026593336",
    "metropolys_retro_session" => "1017693658027557946",
    "metropolys_riviera" => "1016390508259887596"
  }

  @impl true
  def get_push_client_pid(name) do
    try do
      GenericLesIndesEvent.get_push_client_pid(
        "https://www.metropolys.com/ws/metas?id=",
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
