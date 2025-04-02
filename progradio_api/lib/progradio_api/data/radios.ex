defmodule ProgRadioApi.Radios do
  @moduledoc """
  The Radios context.
  """

  import Ecto.Query, warn: false, only: [from: 2]
  use Nebulex.Caching
  alias ProgRadioApi.Repo

  alias ProgRadioApi.Cache
  alias ProgRadioApi.{Radio, SubRadio, RadioStream, Category, Collection, ApiKey, ApiKeyRadio}

  # stream retries before considering it disabled
  #  @retries_max 56

  # one week
  @cache_ttl_default 604_800_000

  # one day
  @cache_ttl_radios 86_400_000

  @decorate cacheable(cache: Cache, key: "radios", opts: [ttl: @cache_ttl_radios])
  def list_active_radios() do
    query =
      from r in Radio,
        join: c in Category,
        on: r.category_id == c.id,
        left_join: rs in RadioStream,
        on: rs.radio_id == r.id and rs.enabled == true,
        left_join: sr in SubRadio,
        on: sr.id == rs.sub_radio_id and sr.enabled == true,
        where: r.active == true,
        select: %{
          id: r.id,
          code_name: r.code_name,
          name: r.name,
          share: r.share,
          country_code: r.country_code,
          category: c.code_name,
          has_preroll: r.has_preroll
        },
        select_merge: %{
          stream_code_name: rs.code_name,
          stream_name: rs.name,
          stream_url: rs.url,
          stream_main: rs.main,
          stream_current_song: rs.current_song,
          stream_status: rs.status,
          stream_retries: rs.retries,
          stream_sub_radio_id: rs.sub_radio_id,
          stream_has_logo: rs.own_logo
        },
        select_merge: %{
          sub_radio_code_name: sr.code_name,
          sub_radio_name: sr.name,
          sub_radio_main: sr.main,
          sub_radio_enabled: sr.enabled,
          sub_radio_radio_stream: rs.code_name
        }

    query
    |> Repo.all()
    |> Enum.reduce(%{}, fn r, acc ->
      radio =
        case Map.has_key?(acc, r.code_name) do
          true ->
            Map.get(acc, r.code_name)

          false ->
            %{
              id: r.id,
              code_name: r.code_name,
              name: r.name,
              share: Decimal.to_float(r.share),
              category: r.category,
              streaming_enabled: false,
              type: "radio",
              country_code: r.country_code,
              has_preroll: r.has_preroll,
              streams: %{},
              sub_radios: %{}
            }
        end

      radio =
        case r do
          e when is_nil(e.stream_code_name) ->
            radio

          # disabled temporarily while investigating how that affects subradios
          # e when e.stream_status == false and e.stream_retries > @retries_max ->
          # radio

          e ->
            stream = %{
              code_name: e.stream_code_name,
              name: e.stream_name,
              url: e.stream_url,
              main: e.stream_main,
              sub_radio: e.stream_sub_radio_id !== nil,
              current_song: e.stream_current_song,
              has_logo: e.stream_has_logo
            }

            put_in(radio, [:streams, stream.code_name], stream)
        end

      radio =
        case r do
          e when is_nil(e.sub_radio_code_name) ->
            radio

          e ->
            sub_radio = %{
              code_name: e.sub_radio_code_name,
              name: e.sub_radio_name,
              main: e.sub_radio_main,
              enabled: e.sub_radio_enabled,
              radio_stream: e.sub_radio_radio_stream
            }

            put_in(radio, [:sub_radios, sub_radio.code_name], sub_radio)
        end

      Map.put(acc, radio.code_name, radio)
    end)
    |> Enum.map(fn {k, r} ->
      case Kernel.map_size(r.streams) do
        0 -> {k, r}
        _ -> {k, %{r | streaming_enabled: true}}
      end
    end)
    |> Enum.into(%{})
  end

  @decorate cacheable(cache: Cache, key: "collections", opts: [ttl: @cache_ttl_default])
  def list_collections() do
    query =
      from c in Collection,
        left_join: r in Radio,
        on: r.collection_id == c.id,
        select: %{
          code_name: c.code_name,
          name_FR: c.name_fr,
          name_EN: c.name_en,
          name_ES: c.name_es,
          name_DE: c.name_en,
          name_PT: c.name_pt,
          name_IT: c.name_it,
          name_PL: c.name_pl,
          name_EL: c.name_el,
          name_AR: c.name_ar,
          name_RO: c.name_ro,
          name_HU: c.name_hu,
          name_TR: c.name_tr,
          name_DK: c.name_dk,
          name_SE: c.name_se,
          short_name: c.short_name,
          priority: c.priority,
          sort_field: c.sort_field,
          sort_order: c.sort_order,
          radios: fragment("array_remove(array_agg(?), null)", r.code_name)
        },
        group_by: [c.id, c.priority],
        order_by: [asc: c.priority, asc: c.id]

    query
    |> Repo.all()
    |> Enum.reduce(%{}, fn c, acc ->
      Map.put(acc, c.code_name, c)
    end)
  end

  @decorate cacheable(cache: Cache, key: "categories", opts: [ttl: @cache_ttl_default])
  def list_categories() do
    query =
      from c in Category,
        select: %{
          code_name: c.code_name,
          name_FR: c.name_fr,
          name_EN: c.name_en,
          name_ES: c.name_es,
          name_DE: c.name_de,
          name_PT: c.name_pt,
          name_IT: c.name_it,
          name_PL: c.name_pl,
          name_EL: c.name_el,
          name_AR: c.name_ar,
          name_RO: c.name_ro,
          name_HU: c.name_hu,
          name_TR: c.name_tr,
          name_SE: c.name_se,
          name_DK: c.name_dk
        },
        order_by: [asc: c.id]

    query
    |> Repo.all()
  end

  def list_radios_per_api_key(api_key) do
    query =
      from r in Radio,
        join: sr in SubRadio,
        on: sr.radio_id == r.id and sr.enabled == true,
        join: c in Collection,
        on: r.collection_id == c.id,
        join: akr in ApiKeyRadio,
        on: r.id == akr.radio_id,
        join: ak in ApiKey,
        on: ak.id == akr.api_key_id,
        select: %{
          collection: c.code_name,
          radios: fragment("array_agg(?)", r.code_name),
          sub_radios: fragment("array_agg(?)", sr.code_name)
        },
        where: ak.id == ^api_key and r.active == true,
        group_by: [c.code_name, r.code_name, c.priority],
        order_by: [asc: c.priority]

    query
    |> Repo.all()
    |> Enum.group_by(& &1.collection, &{&1.radios, &1.sub_radios})
    |> Enum.into(%{}, fn {k, v} ->
      radios =
        Enum.into(v, %{}, fn {radios, sub_radios} ->
          {hd(radios), sub_radios}
        end)

      {k, radios}
    end)
  end
end
