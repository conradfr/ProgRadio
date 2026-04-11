defmodule ProgRadioApi.Importer.StreamsImporter.Api50k do
  require Logger
  import Ecto.Query, only: [from: 2]
  alias Ecto.Multi
  alias ProgRadioApi.Repo
  alias ProgRadioApi.{Stream, StreamOverloading}
  alias ProgRadioApi.Utils.ImporterUtils
  alias ProgRadioApi.Streams

  @base_url "https://50k-radio-stations.p.rapidapi.com"
  @page_size 100
  @timeout 60_000
  @cache_ttl 86400
  @source "api50k"

  def import() do
    Logger.info("50k import")

    {result, _} =
      get_radios()
      |> format()
      |> Enum.uniq_by(fn s -> Map.get(s, :id) end)
      |> Enum.reject(fn s -> Map.get(s, :stream_url, nil) == nil or Map.get(s, :stream_url, "") == "" end)
      |> ImporterUtils.import_images()
      |> store()

    Logger.info("50k import: #{result}")

    :ok
  end

  # Data

  defp get_radios() do
    try do
      fetch_all_pages(1, [])
      |> Enum.uniq_by(fn s -> Map.get(s, "name") end)
      |> Enum.reject(fn s ->
        length(Map.get(s, "streams", [])) == 0
      end)
    rescue
      e ->
        IO.puts("#{inspect e}")
        Logger.warning("50k import: error importing radios - rescue")
        []
    catch
      e ->
        Logger.warning("50k import: error importing radios - catch")
        []
    end
  end

  defp fetch_all_pages(page, acc) do
    url = "#{@base_url}/radios?sort=name&limit=#{@page_size}&page=#{page}"

    Logger.info("50k import: fetching page=#{page}, limit=#{@page_size}")

    cache_key =
      :crypto.hash(:sha, url)
      |> Base.encode16(case: :lower)

    results =
      # we implement cache has the (paying) api has a tendency to timeout
      # we put it in redix instead of Nebulex (ETS) to survive restart
      case Redix.command!(:redix, ["GET", cache_key]) do
        nil ->
          Logger.info("50k import: no cache - #{url}")
          result =
            HTTPoison.get!(
              url,
              [
                {"x-rapidapi-key", Application.get_env(:progradio_api, :stream_import_api_50k_key)},
                {"x-rapidapi-host", "50k-radio-stations.p.rapidapi.com"},
                {"content-type", "application/json"}
              ],
              timeout: @timeout,
              recv_timeout: @timeout,
            )
            |> Map.get(:body)
            |> Jason.decode!()
            |> Map.get("data", [])

          Redix.command!(:redix, ["SETEX", cache_key, @cache_ttl, Jason.encode!(result)])
          result

        result -> Jason.decode!(result)
      end

    new_acc = acc ++ results

    if length(results) >= @page_size do
      fetch_all_pages(page + 1, new_acc)
    else
      new_acc
    end
  end

  defp format(data) do
    data
    |> Enum.map(fn stream ->
      existing_stream = find_stream(stream) || %{}
      id = Map.get(existing_stream, :id) || Ecto.UUID.bingenerate() |> Ecto.UUID.cast!()

      overloading =
        case Repo.get(StreamOverloading, id) do
          nil -> %{}
          overload_data -> overload_data
        end

      img_url =
        stream
        |> Map.get("logo")
        |> ImporterUtils.replace_value_maybe(@source, existing_stream, :original_img)
        |> (&(Map.get(overloading, :img) || &1)).()

      name =
        stream
        |> Map.get("name")
        |> ImporterUtils.replace_value_maybe(@source, existing_stream, :name)
        |> (&(Map.get(overloading, :name) || &1)).()

      country_code =
        stream
        |> Map.get("location", %{})
        |> Map.get("countryCode")
        |> (&(Map.get(overloading, :country_code) || &1)).()

      enabled =
        stream
        |> Map.get("isActive")
        |> (&(Map.get(overloading, :enabled) || &1)).()

      import_updated_at =
        NaiveDateTime.utc_now()
        |> NaiveDateTime.truncate(:second)

      # this api has tags not separated by comma which is not ideal for tags with a space as we can't distinguish them from multiple,
      # so we prioritize existing
      tags =
        Map.get(overloading, :tags) || Map.get(existing_stream, :tags) ||
          case stream |> Map.get("genre", %{}) |> Map.get("text") do
            nil -> Map.get(overloading, :tags) || Map.get(existing_stream, :tags)
            tag -> tag |> String.replace(" ", ",") |> String.downcase()
          end

      language =
        case Map.get(stream, "languages", %{}) do
          nil -> Map.get(overloading, :language) || Map.get(existing_stream, :language)
          lang_list -> lang_list |> Enum.map(& &1["code"]) |> Enum.join(",") |> String.downcase()
        end

      stream_url =
        stream
        |> Map.get("streams", [%{"url": nil}])
        |> List.first()
        |> Map.get("url")
        |> (&(ImporterUtils.replace_value_maybe(&1, @source, existing_stream, :stream_url) || &1)).()
        |> (&(Map.get(overloading, :stream_url) || &1)).()
        |> ImporterUtils.stream_url_transformer()

      %{
        id: id,
        code_name: id,
        external_id:
          Integer.to_string(stream["id"])
          |> ImporterUtils.replace_value_maybe(@source, existing_stream, :external_id),
        name: name,
        img_url: img_url,
        original_img: img_url,
        img: nil,
        stream_url: stream_url,
        original_stream_url: stream_url,
        tags: tags,
        original_tags: Map.get(existing_stream, :tags) || tags,
        country_code: country_code,
        language: language,
        enabled: enabled,
        import_updated_at: import_updated_at,
        source: ImporterUtils.replace_value_maybe(@source, @source, existing_stream, :source)
      }
    end)
    |> Enum.filter(fn s -> s.name !== nil and String.trim(s.name) !== "" end)
  end

  # Store

  defp store(streams) do
    multi_upsert =
      Multi.new()
      |> upsert_streams(streams)

    Logger.debug("50k import upsert: #{Kernel.length(multi_upsert.operations)}")

    Repo.transaction(multi_upsert, timeout: :infinity)
  end

  @spec upsert_streams(Multi.t(), list()) :: any
  defp upsert_streams(multi, streams) do
    streams
    |> Enum.reduce(multi, fn s, acc_multi ->
      changeset = Stream.changeset(%Stream{}, s)

      Ecto.Multi.insert(acc_multi, s.id, changeset,
        on_conflict: [
          set: [
            name: s.name,
            img: s.img,
            original_img: s.original_img,
            country_code: s.country_code,
            tags: s.tags,
            stream_url: s.stream_url,
            enabled: s.enabled,
            import_updated_at: s.import_updated_at,
            external_id: s.external_id
          ]
        ],
        conflict_target: :id
      )
    end)
  end

  defp find_stream(%{} = data) do
    # we use '' instead of nil to avoid dealing with is_nil() in the query
    country_code =
      data
      |> Map.get("location", %{})
      |> Map.get("countryCode", "") || ""

    country_code =
      if is_list(country_code) do
        case length(country_code) == 0 do
          true -> ""
          _ -> hd(country_code)
        end
      else
        country_code
      end

    country_code =
      case country_code do
        nil -> ""
        _ -> country_code
      end

    stream_url =
      data
      |> Map.get("streams", [%{"url" => nil}])
      |> List.first()
      |> Map.get("url")

    from(s in Stream,
      where:
        ((s.stream_url == ^stream_url or s.original_stream_url == ^stream_url) and s.country_code == ^country_code) or
          (s.source == @source and s.external_id == ^(data["id"] |> Integer.to_string())),
      limit: 1
    )
    |> Repo.one()
  end
end
