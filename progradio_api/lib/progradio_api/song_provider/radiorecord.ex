defmodule ProgRadioApi.SongProvider.Radiorecord do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @url "https://www.radiorecord.ru/api/stations/now/"

  @genre %{
    "none" => 15016,
    "ambient" => 42650,
    "beachparty" => 44331,
    "bighits" => 501,
    "breaks" => 544,
    "cadillac" => 513,
    "chillouse" => 515,
    "chillout" => 534,
    "chil" => 534,
    "christmas" => 42375,
    "club" => 44188,
    "complextro" => 517,
    "darkside" => 503,
    "deep" => 528,
    "dream" => 502,
    "dreampop" => 42602,
    "discofunk" => 527,
    "elect" => 496,
    "eurodance" => 525,
    "fbass" => 549,
    "jackin" => 541,
    "goa" => 531,
    "gold" => 493,
    "groovetribal" => 518,
    "hbass" => 551,
    "houseclss" => 505,
    "househits" => 500,
    "hypno" => 543,
    "jungle" => 521,
    "liquidfunk" => 522,
    "lofi" => 42532,
    "megamix" => 520,
    "mix" => 520,
    "mini" => 535,
    "neurofunk" => 507,
    "nudance" => 43926,
    "organic" => 42715,
    "phonk" => 43174,
    "progr" => 498,
    "rap" => 511,
    "record" => 15016,
    "reggae" => 43338,
    "remix" => 548,
    "rmx" => 548,
    "rock" => 554,
    "rus" => 537,
    "russiangold" => 524,
    "russianhits" => 519,
    "russianmix" => 537,
    "sd90" => 539,
    "summerlounge" => 43337,
    "synth" => 499,
    "techno" => 547,
    "technopop" => 526,
    "trancehouse" => 542,
    "tm" => 533,
    "trap" => 552,
    "trop" => 530,
    "uplift" => 504,
    "vip" =>538,
    "workout" => 43339,
  }

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, _last_data) do
    "song:radiorecord_" <> url = name
    [genre] = Regex.run(~r/record-([a-z]+)\//, url, capture: :all_but_first) || ["none"]
    channel = @genre[genre]

    try do
      @url
      |> SongProvider.get()
      |> Map.get(:body)
      |> Jason.decode!()
      |> Map.get("result")
      |> Enum.find(fn e -> e["id"] == channel end)
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

      %{artist: artist, title: title}
    rescue
      reason ->
        Logger.error("Data provider - #{name} (radiorecord): task error rescue (#{inspect(reason)})")
        :error
    catch
      :exit, _ ->
        Logger.error("Data provider - #{name} (radiorecord): task error catch")
        :error
    end
  end

end
