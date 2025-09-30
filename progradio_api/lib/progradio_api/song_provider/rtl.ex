defmodule ProgRadioApi.SongProvider.Rtl do
  require Logger

  alias ProgRadioApi.SongProvider.GenericRtlgroup
  alias ProgRadioApi.SongProvider.GenericRtlgroup2
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @stream_ids %{
    "rtl_main" => "",
    "rtl_grosses_tetes" => "",
    "rtl_100_france" => "62826c29203b6e223e9d98e7",
    "rtl_100_hits" => "62826c07ffe16b07d248f18b",
    "rtl_collection_georges_lang" => "66165d554e34a01a336c767f",
    "rtl_100_80" => "647de2277c4bd84ed40f56fa",
    "rtl_grand_studio" => "647de254ee62ff54dcde4c6a"
  }

  @url "https://www.rtl.fr/quel-est-ce-titre/"

  @impl true
  def has_custom_refresh(name) do
    key =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()

    key != ""
  end

  @impl true
  def get_refresh(name, data, default_refresh) do
    key =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()

    if key != "" do
      GenericRtlgroup2.get_refresh(name, data, default_refresh)
    else
      GenericRtlgroup.get_refresh(name, data, default_refresh)
    end
  end

  @impl true
  def get_data(name, last_data) do
    key =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()

    if key != "" do
      GenericRtlgroup2.get_data(key, name, last_data)
    else
      GenericRtlgroup.get_data(@url)
    end
  end

  @impl true
  def get_song(name, data, last_song) do
    key =
      SongProvider.get_stream_code_name_from_channel(name)
      |> (&Map.get(@stream_ids, &1)).()

    if key != "" do
      GenericRtlgroup2.get_song(name, data, last_song)
    else
      GenericRtlgroup.get_song(name, data, last_song)
    end
  end
end
