defmodule ProgRadioApi.Utils.ImporterUtils do
  alias ProgRadioApi.Importer.ImageImporter
  alias ProgRadioApi.Importer.Tools.Images
  alias ProgRadioApi.Importer.StreamsImporter.Transformers.Streams, as: StreamTransformers

  @max_concurrency 4
  @task_timeout 1_000_000

  @source_priority %{
    nil => 0,
    "radio-browser" => 1,
    "api50k" => 2,
    "streema" => 3,
    "weloveradio" => 4,
    "lautfm" => 5,
    "progradio" => 6,
    "internal" => 7,
  }

  def replace_value_maybe(value, source_caller, existing_stream, existing_key \\ nil)

  def replace_value_maybe(value, _source_caller, existing_stream, existing_key)
      when is_map_key(existing_stream, existing_key) == false, do: value

  def replace_value_maybe(value, _source_caller, existing_stream, _existing_key)
      when is_map_key(existing_stream, :source) == false, do: value

  def replace_value_maybe(value, source_caller, existing_stream, existing_key) do
    caller_priority = Map.get(@source_priority, source_caller, 0)
    existing_priority = Map.get(@source_priority, existing_stream.source, 0)

    if caller_priority >= existing_priority do
      value || Map.get(existing_stream, existing_key)
    else
      Map.get(existing_stream, existing_key) || value
    end
  end

  # upgrade urls with known formats to newer one that will work anytime
  def stream_url_transformer(stream_url) do
    {_, updated_stream_url} =
      {:continue, stream_url}
      |> StreamTransformers.autopost()
      |> StreamTransformers.provider_params()
      |> StreamTransformers.streamtheworld()
      |> StreamTransformers.streamtheworld_url()
      |> StreamTransformers.infomaniak()
      |> StreamTransformers.ssr()
      |> StreamTransformers.zeno()
      |> StreamTransformers.zeno_url()
      |> StreamTransformers.laut()
      |> StreamTransformers.laut_url()
      |> StreamTransformers.network181()
      |> StreamTransformers.exclusive_to_m3u8()
      |> StreamTransformers.you_classical_radio_to_m3u8()
      |> StreamTransformers.tiktok_to_m3u8()
      |> StreamTransformers.positively_relaxation_to_m3u8()
      |> StreamTransformers.exclusive()
      |> StreamTransformers.harmony()
      |> StreamTransformers.streamabc()
      |> StreamTransformers.radioparadise()
      |> StreamTransformers.creacast()
      |> StreamTransformers.network1fm()
      |> StreamTransformers.radiojar()
      |> StreamTransformers.radiojar_url()
      |> StreamTransformers.prohifi()
      #      |> StreamTransformers.revma()
      #      |> StreamTransformers.revma_url()
      |> StreamTransformers.r80s80s()
      |> StreamTransformers.bobde()
      |> StreamTransformers.regenbogen()
      |> StreamTransformers.securenetsystems()
      |> StreamTransformers.radioca()
      |> StreamTransformers.radiosenlinea()

    updated_stream_url
  end
end
