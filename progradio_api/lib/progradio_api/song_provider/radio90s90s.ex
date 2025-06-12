defmodule ProgRadioApi.SongProvider.Radio90s90s do
  require Logger
  alias ProgRadioApi.SongProvider
  alias ProgRadioApi.SongProvider.GenericLoveradio

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "radio90s90s_livestream" => 141,
    "radio90s90s_inthemix" => 389,
    "radio90s90s_dance" => 692,
    "radio90s90s_millenium" => 791,
    "radio90s90s_eurodance" => 188,
    "radio90s90s_hiphop" => 265,
    "radio90s90s_soul_rnb" => 266,
    "radio90s90s_techno" => 261,
    "radio90s90s_grunge" => 253,
    "radio90s90s_clubhits" => 140,
    "radio90s90s_trance" => 704,
    "radio90s90s_lovesongs" => 527,
    "radio90s90s_rock" => 652,
    "radio90s90s_sommerhits" => 505,
    "radio90s90s_loveparade" => 707,
    "radio90s90s_boygroups" => 149,
    "radio90s90s_house" => 655,
    "radio90s90s_hiphop_deutsch" => 439,
    "radio90s90s_rave" => 705,
    "radio90s90s_dinnerparty" => 743,
    "radio90s90s_mayday" => 706,
    "radio90s90s_reggae" => 778,
    "radio90s90s_britpop" => 787,
    "radio90s90s_sachsen" => 779,
    "radio90s90s_nrw" => 783,
    "radio90s90s_dab+" => 683,
  }

  @impl true
  defdelegate has_custom_refresh(), to: GenericLoveradio

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: GenericLoveradio

  @impl true
  def get_data(name, _last_data) do
    id =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()

    GenericLoveradio.get_data("90s90s", id)
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: GenericLoveradio
end
