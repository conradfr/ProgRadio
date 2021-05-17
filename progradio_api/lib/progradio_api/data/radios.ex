defmodule ProgRadioApi.Radios do
  @moduledoc """
  The Radios context.
  """

  import Ecto.Query, warn: false, only: [from: 2]
  alias ProgRadioApi.Repo

  alias ProgRadioApi.Utils
  alias ProgRadioApi.{Radio, RadioStream, Category, Collection}

  # stream retries before considering it disabled
  @retries_max 12

  # one week
  @cache_ttl_default 604_800_000

  # one day
  @cache_ttl_radios 86_400_000

  def list_active_radios() do
    {_, radios} =
      Cachex.fetch(
        :progradio_cache,
        "radios",
        fn _key ->
          query =
            from r in Radio,
              join: c in Category,
              on: r.category_id == c.id,
              left_join: rs in RadioStream,
              on: rs.radio_id == r.id and rs.enabled == true,
              where: r.active == true,
              select: %{
                id: r.id,
                code_name: r.code_name,
                name: r.name,
                share: r.share,
                category: c.code_name
              },
              select_merge: %{
                stream_code_name: rs.code_name,
                stream_name: rs.name,
                stream_url: rs.url,
                stream_main: rs.main,
                stream_current_song: rs.current_song,
                stream_status: rs.status,
                stream_retries: rs.retries
              }

          result =
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
                      streams: %{}
                    }
                end

              radio =
                case r do
                  e when is_nil(e.stream_code_name) ->
                    radio

                  e when e.stream_status == false and e.stream_retries > @retries_max ->
                    radio

                  e ->
                    stream = %{
                      code_name: e.stream_code_name,
                      name: e.stream_name,
                      url: e.stream_url,
                      main: e.stream_main,
                      current_song: e.stream_current_song
                    }

                    put_in(radio, [:streams, stream.code_name], stream)
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

          {:commit, result}
        end
      )

    Utils.set_ttl_if_none("radios", @cache_ttl_radios)

    radios
  end

  def list_collections() do
    {_, collections} =
      Cachex.fetch(
        :progradio_cache,
        "collections",
        fn _key ->
          query =
            from c in Collection,
              left_join: r in Radio,
              on: r.collection_id == c.id,
              select: %{
                code_name: c.code_name,
                name_FR: c.name,
                short_name: c.short_name,
                priority: c.priority,
                sort_field: c.sort_field,
                sort_order: c.sort_order,
                radios: fragment("array_remove(array_agg(?), null)", r.code_name)
              },
              group_by: [c.id, c.priority],
              order_by: [asc: c.priority, asc: c.id]

          result =
            query
            |> Repo.all()
            |> Enum.reduce(%{}, fn c, acc ->
              Map.put(acc, c.code_name, c)
            end)

          {:commit, result}
        end
      )

    Utils.set_ttl_if_none("collections", @cache_ttl_default)

    collections
  end

  def list_categories() do
    {_, categories} =
      Cachex.fetch(
        :progradio_cache,
        "categories",
        fn _key ->
          query =
            from c in Category,
              select: %{
                code_name: c.code_name,
                name_FR: c.name
              },
              order_by: [asc: c.id]

          result =
            query
            |> Repo.all()

          {:commit, result}
        end
      )

    Utils.set_ttl_if_none("categories", @cache_ttl_default)

    categories
  end
end
