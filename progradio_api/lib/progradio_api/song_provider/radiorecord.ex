defmodule ProgRadioApi.SongProvider.Radiorecord do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.radiorecord.ru/api/stations/now/"

  @genre %{
    "radiorecord_none" => 15016,
    "radiorecord_ambient" => 42650,
    "radiorecord_beachparty" => 44331,
    "radiorecord_bighits" => 501,
    "radiorecord_breaks" => 544,
    "radiorecord_cadillac" => 513,
    "radiorecord_chillouse" => 515,
    "radiorecord_chillout" => 534,
    "radiorecord_chil" => 534,
    "radiorecord_christmas" => 42375,
    "radiorecord_club" => 44188,
    "radiorecord_complextro" => 517,
    "radiorecord_darkside" => 503,
    "radiorecord_deep" => 528,
    "radiorecord_dream" => 502,
    "radiorecord_dreampop" => 42602,
    "radiorecord_discofunk" => 527,
    "radiorecord_electro" => 496,
    "radiorecord_eurodance" => 525,
    "radiorecord_fbass" => 549,
    "radiorecord_jackin" => 541,
    "radiorecord_goa" => 531,
    "radiorecord_gold" => 493,
    "radiorecord_groovetribal" => 518,
    "radiorecord_hbass" => 551,
    "radiorecord_houseclss" => 505,
    "radiorecord_househits" => 500,
    "radiorecord_hypno" => 543,
    "radiorecord_jungle" => 521,
    "radiorecord_liquidfunk" => 522,
    "radiorecord_lofi" => 42532,
    "radiorecord_megamix" => 520,
    "radiorecord_mix" => 520,
    "radiorecord_mini" => 535,
    "radiorecord_neurofunk" => 507,
    "radiorecord_nudance" => 43926,
    "radiorecord_organic" => 42715,
    "radiorecord_phonk" => 43174,
    "radiorecord_progr" => 498,
    "radiorecord_rap" => 511,
    "radiorecord_record" => 15016,
    "radiorecord_reggae" => 43338,
    "radiorecord_remix" => 548,
    "radiorecord_rmx" => 548,
    "radiorecord_rock" => 554,
    "radiorecord_rus" => 537,
    "radiorecord_russiangold" => 524,
    "radiorecord_russianhits" => 519,
    "radiorecord_russianmix" => 537,
    "radiorecord_sd90" => 539,
    "radiorecord_summerlounge" => 43337,
    "radiorecord_synth" => 499,
    "radiorecord_techno" => 547,
    "radiorecord_technopop" => 526,
    "radiorecord_trancehouse" => 542,
    "radiorecord_tm" => 533,
    "radiorecord_trap" => 552,
    "radiorecord_trop" => 530,
    "radiorecord_uplift" => 504,
    "radiorecord_vip" => 538,
    "radiorecord_workout" => 43339
  }

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    IO.puts("----------------------------------------")
    IO.puts("#{inspect name}")
    channel =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@genre, &1)).()
      |> IO.inspect()

    try do
      @url
      |> SongProvider.get()
      |> Map.get(:body)
      |> Jason.decode!()
      |> Map.get("result")
      |> Enum.find(fn e -> e["id"] == channel end)
      |> IO.inspect()
    rescue
      _ ->
        Logger.error("Data provider - #{name} (radiorecord): data error rescue")
        :error
    end
  end

  @impl true
  def get_song(_name, :error), do: nil

  @impl true
  def get_song(_name, nil), do: nil

  @impl true
  def get_song(name, data) do
    try do
      artist =
        data
        |> Map.get("track", %{})
        |> Map.get("artist")
        |> SongProvider.recase()

      title =
        data
        |> Map.get("track", %{})
        |> Map.get("song")

      cover =
        data
        |> Map.get("track", %{})
        |> Map.get("image100")

      cover =
        case cover do
          nil -> nil
          _ -> "https://www.radiorecord.ru/" <> cover
        end

      %{
        artist: artist,
        title: title,
        cover_url: cover
      }
    rescue
      reason ->
        Logger.error(
          "Data provider - #{name} (radiorecord): task error rescue (#{inspect(reason)})"
        )

        :error
    catch
      :exit, _ ->
        Logger.error("Data provider - #{name} (radiorecord): task error catch")
        :error
    end
  end
end
