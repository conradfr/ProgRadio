defmodule ProgRadioApi.Search do
  require Application
  import Ecto.Query

  alias ProgRadioApi.Repo
  alias ProgRadioApi.Stream

  def index_all()  do
    query =
      from s in Stream,
      where: is_nil(s.redirect_to) == true and s.enabled == true and s.banned == false,
      select:
        %{
          id: s.id,
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
    Meilisearch.Index.create(client, index)
    Meilisearch.Index.create(client, new_index)
    Meilisearch.Document.create_or_replace(client, new_index, streams)
    Meilisearch.Index.swap(client, [%{indexes: [ new_index, index]}])
    Meilisearch.Index.delete(client, new_index)
  end

  def update_stream(%Stream{} = stream) do
    data =
      %{
        id: stream.id,
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

  defp get_index_name() do
    Application.get_env(:progradio_api, :meilisearch_prefix) <> "streams"
  end

  defp get_index_new_name() do
    Application.get_env(:progradio_api, :meilisearch_prefix) <> "streams_new"
  end
end
