defmodule ProgRadioApi.Search do
  require Application
  import Ecto.Query

  alias ProgRadioApi.Repo
  alias ProgRadioApi.Stream

  def index_all() do
    query =
      from s in Stream,
        where: is_nil(s.redirect_to) == true and s.enabled == true and s.banned == false,
        select: %{
          id: s.id,
          objectID: s.id,
          name: s.name,
          tags: s.tags,
          language: s.language,
          country_code: s.country_code,
          clicks_last_24h: s.clicks_last_24h,
          score: s.score
        }

    streams = Repo.all(query)
    client = Meilisearch.client(:search)
    index = get_index_name()
    new_index = get_index_new_name()

    # should return 400 but used as a security
    Meilisearch.Index.delete(client, new_index)
    # we use objectID because that seems hardcoded in the PHP lib
    Meilisearch.Index.create(client, %{uid: index, primaryKey: "objectID"})
    Meilisearch.Index.create(client, %{uid: new_index, primaryKey: "objectID"})

    Meilisearch.Settings.SortableAttributes.update(client, new_index, [
      "name",
      "score",
      "clicks_last_24h"
    ])

    Meilisearch.Settings.FilterableAttributes.update(client, new_index, ["country_code"])
    Meilisearch.Document.create_or_replace(client, new_index, streams)
    Meilisearch.Index.swap(client, [%{indexes: [new_index, index]}])
    Meilisearch.Index.delete(client, new_index)
  end

  def update_stream(%Stream{} = stream) do
    data =
      %{
        id: stream.id,
        objectID: stream.id,
        name: stream.name,
        tags: stream.tags,
        language: stream.language,
        country_code: stream.country_code,
        clicks_last_24h: stream.clicks_last_24h,
        score: stream.score
      }

    :search
    |> Meilisearch.client()
    |> Meilisearch.Document.create_or_replace(get_index_name(), data)
  end

  def delete_stream(stream_id) when is_binary(stream_id) do
    :search
    |> Meilisearch.client()
    |> Meilisearch.Document.delete_one(get_index_name(), stream_id)
  end

  def search(%{:text => text} = params) when is_binary(text) do
    q_params =
      %{
        q: text,
        attributesToRetrieve: ["id"]
      }
      |> add_offset(params)
      |> add_limit(params)
      |> add_sort(params)
      |> add_country(params)

    :search
    |> Meilisearch.client()
    |> Meilisearch.Search.search(get_index_name(), q_params)
  end

  defp add_offset(params, %{:offset => offset}) when is_integer(offset),
    do: Map.put(params, :offset, offset)

  defp add_offset(params, _), do: params

  defp add_limit(params, %{:limit => limit}) when is_integer(limit),
    do: Map.put(params, :limit, limit)

  defp add_limit(params, _), do: params

  defp add_country(params, %{:country => country_code}) when is_binary(country_code) do
    q_country = String.upcase(country_code)
    q_filter = "country_code = '#{q_country}'"
    Map.put(params, :filter, q_filter)
  end

  defp add_country(params, _), do: params

  defp add_sort(params, %{:sort => sort}) when is_binary(sort) do
    q_sort =
      case sort do
        "popularity" -> ["score:desc", "clicks_last_24h:desc"]
        "name" -> ["name:asc"]
      end

    Map.put(params, :sort, q_sort)
  end

  defp add_sort(params, _), do: params

  defp get_index_name() do
    Application.get_env(:progradio_api, :meilisearch_prefix) <> "streams"
  end

  defp get_index_new_name() do
    Application.get_env(:progradio_api, :meilisearch_prefix) <> "streams_new"
  end
end
