defmodule ProgRadioApi.Importer.StreamsImporter.RadioBrowser do
  require Logger
  import Ecto.Query, only: [from: 2]
  alias Ecto.Multi
  alias ProgRadioApi.Repo
  alias ProgRadioApi.{Stream, StreamOverloading}
  alias ProgRadioApi.Streams
  alias ProgRadioApi.Importer.ImageImporter
  alias ProgRadioApi.Importer.StreamsImporter.StreamMatcher

  # TODO unbundle if we diversify streams sources

  @servers_dns "all.api.radio-browser.info"
  @api_all_radios "stations"

  @max_concurrency 4
  @task_timeout 1_000_000

  def import() do
    {result, _} =
      get_one_random_server()
      |> get_radios()
      |> format()
      |> import_images()
      |> delete_images_from_removed_stations()
      |> store()

    Logger.info("Streams import: #{result}")

    overload_disabled()
    reattach_image_of_stream_with_no_image()
    find_redirect_for_disabled_streams()
    StreamMatcher.match()
    :ok
  end

  # we don't use the radio-browser as the radio may be absent from there and radio-browser barely updates radios anyway
  # todo clean up this module and move some of it to an independent module
  def overload_recently_updated() do
    Streams.get_recently_overload_updated_ids()
    |> Enum.each(fn stream_id when is_binary(stream_id) ->
      Repo.get(Stream, stream_id)
      |> __MODULE__.format_from_stream()
      |> import_image()
      |> store_one()
    end)
  end

  # Data

  defp get_radios(host, stream_id \\ nil) do
    # ?limit=5&offset=500
    url =
      if stream_id != nil and is_binary(stream_id) do
        "https://#{host}/json/#{@api_all_radios}/byuuid/#{stream_id}"
      else
        "https://#{host}/json/#{@api_all_radios}"
      end

    Logger.info("Streams import: url - #{url}")

    try do
      HTTPoison.get!(
        url,
        [{"User-Agent", "radio-addict.com"}]
      )
      |> Map.get(:body)
      |> Jason.decode!()
      |> Enum.uniq_by(fn s -> Map.get(s, "stationuuid") end)
      |> Enum.filter(fn s ->
        Map.get(s, "lastcheckok") !== 0 and Map.get(s, "stationuuid") !== "" and
          Map.get(s, "name") !== "" and
          (Map.get(s, "url_resolved") !== "" or Map.get(s, "url") !== "")
      end)
      # the app can't read hls streams that are not served by https (cross-origin problem)
      |> Enum.reject(fn s ->
        Map.get(s, "url") |> String.downcase() |> String.starts_with?("https") === false and
          Map.get(s, "url") |> String.downcase() |> String.ends_with?(".m3u8") === true
      end)
    rescue
      _ ->
        Logger.warning("Streams import: error importing radios")
        []
    catch
      _ ->
        Logger.warning("Streams import: error importing radios")
        []
    end
  end

  defp format(data) do
    data
    |> Enum.map(fn stream ->
      id = Map.get(stream, "stationuuid")

      overloading =
        case Repo.get(StreamOverloading, id) do
          nil -> %{}
          overload_data -> overload_data
        end

      stream_url =
        case Map.get(stream, "url_resolved") do
          "" -> Map.get(stream, "url")
          value -> value
        end
        # found in some entries, not sure of a better way to remove them
        |> String.trim("\u0000")
        |> String.trim()

      name =
        stream
        |> Map.get("name")
        |> String.trim("\u0000")
        |> String.trim()

      img_url = Map.get(stream, "favicon")
      country_code = Map.get(stream, "countrycode")
      website = Map.get(stream, "homepage")

      enabled =
        case Map.get(overloading, :enabled, nil) do
          true -> true
          false -> false
          _ -> true
        end

      import_updated_at =
        NaiveDateTime.utc_now()
        |> NaiveDateTime.truncate(:second)

      %{
        id: id,
        code_name: id,
        name: Map.get(overloading, :name) || name,
        img_url: Map.get(overloading, :img) || img_url,
        original_img: img_url,
        img: nil,
        website: Map.get(overloading, :website) || website,
        stream_url: (Map.get(overloading, :stream_url) || stream_url) |> stream_url_transformer(),
        original_stream_url: stream_url,
        tags: Map.get(overloading, :tags) || Map.get(stream, "tags"),
        original_tags: Map.get(stream, "tags"),
        country_code: Map.get(overloading, :country_code) || country_code,
        language: Map.get(stream, "language"),
        votes: Map.get(stream, "votes"),
        clicks_last_24h: Map.get(stream, "clickcount"),
        enabled: enabled,
        import_updated_at: import_updated_at
      }
    end)
    |> Enum.filter(fn s -> s.name !== nil and String.trim(s.name) !== "" end)
  end

  def format_from_stream(%Stream{} = stream) do
    overloading =
      case Repo.get(StreamOverloading, stream.id) do
        nil -> %{}
        data -> data
      end

    enabled =
      case Map.get(overloading, :enabled, nil) do
        true -> true
        false -> false
        _ -> stream.enabled
      end

    import_updated_at =
      NaiveDateTime.utc_now()
      |> NaiveDateTime.truncate(:second)

    %{
      id: stream.id,
      code_name: stream.id,
      name: Map.get(overloading, :name) || stream.name,
      img_url: Map.get(overloading, :img) || stream.original_img,
      img: stream.img,
      original_img: stream.original_img,
      website: Map.get(overloading, :website) || stream.website,
      stream_url:
        (Map.get(overloading, :stream_url) || stream.stream_url) |> stream_url_transformer(),
      original_stream_url: stream.original_stream_url,
      tags: stream.tags,
      original_tags: stream.original_tags,
      country_code: Map.get(overloading, :country_code) || stream.country_code,
      language: stream.language,
      votes: stream.votes,
      clicks_last_24h: stream.clicks_last_24h,
      enabled: enabled,
      import_updated_at: import_updated_at
    }
  end

  # Images

  defp import_images(streams) do
    streams
    |> Task.async_stream(fn s -> import_image(s) end,
      timeout: @task_timeout,
      max_concurrency: @max_concurrency
    )
    |> Enum.reduce([], fn {:ok, s}, acc -> acc ++ [s] end)
  end

  @spec import_image(struct) :: struct
  defp import_image(stream) do
    case stream.img_url do
      url when is_binary(url) and url !== "" ->
        case String.ends_with?(url, ".svg") do
          false ->
            Map.delete(stream, :img_url)

            try do
              with {:ok, filename} <- ImageImporter.import_stream(url, stream) do
                Map.put(stream, :img, filename)
              else
                _ -> stream
              end
            rescue
              _ ->
                stream
            catch
              _ ->
                stream

              :exit, _ ->
                stream
            end

          true ->
            stream
        end

      _ ->
        stream
    end
  end

  defp delete_images_from_removed_stations(streams) do
    ids_to_keep =
      Enum.map(streams, fn s ->
        {:ok, uuid} = Ecto.UUID.dump(s.id)
        uuid
      end)

    #
    #    query =
    #      from(
    #        s in "stream",
    #        left_join: so in StreamOverloading,
    #        on: so.id == s.id,
    #        where: s.id not in ^ids_to_keep and so.enabled != true,
    #        select: s.img
    #      )
    #
    #    img_to_del = Repo.all(query)
    #
    #    Enum.each(img_to_del, fn img ->
    #      "#{Application.get_env(:progradio_api, :image_path)}#{@image_folder}/#{img}"
    #      |> File.rm()
    #    end)

    {ids_to_keep, streams}
  end

  # upgrade urls with known formats to newer one that will work anytime
  # todo as most of these are similar maybe streamline to less functions
  defp stream_url_transformer(stream_url) do
    {_, updated_stream_url} =
      {:continue, stream_url}
      |> stream_url_transformer_streamtheworld()
      |> stream_url_transformer_infomaniak()
      |> stream_url_transformer_ssr()
      |> stream_url_transformer_zeno()
      |> stream_url_transformer_laut()
      |> stream_url_transformer_181()
      |> stream_url_transformer_exclusive()
      |> stream_url_transformer_harmony()
      |> stream_url_transformer_streamabc()
      |> stream_url_transformer_radioparadise()
      |> stream_url_transformer_creacast()

    updated_stream_url
  end

  # generated by ChatGPT4 because lazy)
  defp stream_url_transformer_streamtheworld({:continue, stream_url}) do
    # Matches URLs from streamtheworld with any number after the colon
    pattern = ~r/(https?:\/\/\d+\.live\.streamtheworld\.com(:\d+)?\/)(\w+)/

    case Regex.match?(pattern, stream_url) and
         !String.contains?(stream_url, ".m3u8") do
      true ->
        replacement_fn = fn _, _, _, last_part ->
          "https://playerservices.streamtheworld.com/api/livestream-redirect/#{last_part}"
        end

        {:ok, Regex.replace(pattern, stream_url, replacement_fn)}

      false ->
        {:continue, stream_url}
    end
  end

  defp stream_url_transformer_streamtheworld(stream_url), do: stream_url

  defp stream_url_transformer_infomaniak({:continue, stream_url}) do
    pattern = ~r/http:(.+)\.infomaniak\.(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  defp stream_url_transformer_infomaniak(stream_url), do: stream_url

  defp stream_url_transformer_ssr({:continue, stream_url}) do
    pattern = ~r/http:(.+)\.srg-ssr\.(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  defp stream_url_transformer_ssr(stream_url), do: stream_url

  defp stream_url_transformer_zeno({:continue, stream_url}) do
    pattern = ~r/http:\/\/stream\-(.+)\.zeno\.(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  defp stream_url_transformer_zeno(stream_url), do: stream_url

  defp stream_url_transformer_laut({:continue, stream_url}) do
    pattern = ~r/http:\/\/(.+)\.stream\.laut\.fm(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  defp stream_url_transformer_laut(stream_url), do: stream_url

  defp stream_url_transformer_181({:continue, stream_url}) do
    pattern = ~r/http:\/\/(.+)\.181fm\.com(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  defp stream_url_transformer_181(stream_url), do: stream_url

  defp stream_url_transformer_exclusive({:continue, stream_url}) do
    pattern = ~r/http:\/\/(.+)\.exclusive\.radio(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  defp stream_url_transformer_exclusive(stream_url), do: stream_url

  defp stream_url_transformer_harmony({:continue, stream_url}) do
    pattern = ~r/http:\/\/(.+)\.harmonyfm(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  defp stream_url_transformer_harmony(stream_url), do: stream_url

  defp stream_url_transformer_streamabc({:continue, stream_url}) do
    pattern = ~r/http:\/\/(.+)\.streamabc(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  defp stream_url_transformer_streamabc(stream_url), do: stream_url

  defp stream_url_transformer_radioparadise({:continue, stream_url}) do
    pattern = ~r/http:\/\/(.+)\.stream\.radioparadise\.com(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  defp stream_url_transformer_radioparadise(stream_url), do: stream_url

  defp stream_url_transformer_creacast({:continue, stream_url}) do
    pattern = ~r/http:\/\/(.+)creacast\.com(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  defp stream_url_transformer_creacast(stream_url), do: stream_url

  # Store

  # note: multi has just been copied from below function to reuse functions
  defp store_one(stream) do
    multi_upsert =
      Multi.new()
      |> upsert_streams([stream])

    Repo.transaction(multi_upsert, timeout: :infinity)
  end

  defp store({ids_to_keep, streams} = _args) do
    multi_delete =
      Multi.new()
      |> delete_streams(ids_to_keep)

    multi_upsert =
      Multi.new()
      |> upsert_streams(streams)

    Logger.debug("Streams import upsert: #{Kernel.length(multi_upsert.operations)}")

    multi_combine = Ecto.Multi.append(multi_delete, multi_upsert)
    Repo.transaction(multi_combine, timeout: :infinity)
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
            original_tags: s.original_tags,
            website: s.website,
            language: s.language,
            stream_url: s.stream_url |> stream_url_transformer(),
            original_stream_url: s.original_stream_url,
            votes: s.votes,
            clicks_last_24h: s.clicks_last_24h,
            enabled: s.enabled,
            import_updated_at: s.import_updated_at
          ]
        ],
        conflict_target: :id
      )
    end)
  end

  @spec delete_streams(Multi.t(), list()) :: any
  defp delete_streams(multi, _to_not_delete) do
    multi
    #    ids_to_keep =
    #      from(so in StreamOverloading,
    #        where: so.enabled == true,
    #        select: so.id
    #      )
    #      |> Repo.all()
    #      |> Enum.map(fn stream_id ->
    #        Ecto.UUID.dump!(stream_id)
    #      end)
    #      |> Enum.concat(to_not_delete)
    #
    #    # soft delete
    #    q =
    #      from(
    #        s in "stream",
    #        where: s.id not in ^ids_to_keep,
    #        update: [set: [enabled: false]]
    #      )
    #
    #    Multi.update_all(multi, :update_enabled, q, [])
  end

  # overload the streams that are no longer on radio-browser but that we keep
  def overload_disabled() do
    streams =
      from(so in StreamOverloading,
        join: s in Stream,
        on: so.id == s.id,
        where: s.enabled == false,
        select: %{
          id: s.id,
          code_name: s.id,
          tags: s.tags,
          original_tags: s.original_tags,
          language: s.language,
          votes: s.votes,
          clicks_last_24h: s.clicks_last_24h,
          name: fragment("COALESCE(?, ?)", so.name, s.name),
          img_url: so.img,
          img: s.img,
          original_img: s.original_img,
          stream_url: fragment("COALESCE(?, ?)", so.stream_url, s.stream_url),
          original_stream_url: s.original_stream_url,
          country_code: fragment("COALESCE(?, ?)", so.country_code, s.country_code),
          enabled: fragment("COALESCE(?, ?)", so.enabled, s.enabled),
          website: fragment("COALESCE(?, ?)", so.website, s.website),
          import_updated_at: s.import_updated_at
        }
      )
      |> Repo.all()
      |> import_images()

    Multi.new()
    |> upsert_streams(streams)
    |> Repo.transaction(timeout: :infinity)
  end

  # API

  def get_one_random_server() do
    get_servers()
    |> Enum.random()
    |> Map.get(:data)
    |> :inet.gethostbyaddr()
    |> Kernel.elem(1)
    |> Kernel.elem(1)
  end

  # DNS lookup
  defp get_servers() do
    DNS.query(@servers_dns)
    |> Map.get(:anlist)
  end

  # Disabled

  def find_redirect_for_disabled_streams() do
    get_disabled_with_no_redirect()
    |> Enum.map(fn s -> find_redirect_stream(s) end)
    |> Enum.filter(&(&1 != nil))
    |> Enum.each(&update_stream_with_redirect/1)
  end

  defp get_disabled_with_no_redirect() do
    from(s in Stream,
      where: is_nil(s.redirect_to) and not is_nil(s.country_code) and s.enabled == false,
      select: %{id: s.id, name: s.name, country_code: s.country_code}
    )
    |> Repo.all()
  end

  defp find_redirect_stream(stream_data) do
    redirect_stream_id =
      from(s in Stream,
        where:
          fragment("LOWER(?) = ?", s.name, ^String.downcase(stream_data.name)) and
            s.country_code == ^stream_data.country_code and s.enabled == true,
        order_by: [desc: s.clicks_last_24h, desc: s.votes],
        limit: 1,
        select: s.id
      )
      |> Repo.one()

    case redirect_stream_id do
      nil -> nil
      _ -> {stream_data.id, redirect_stream_id}
    end
  end

  defp update_stream_with_redirect({stream_id, redirect_stream_id}) do
    query =
      from s in Stream,
        where: s.id == ^stream_id

    Repo.update_all(query, set: [redirect_to: redirect_stream_id])
  end

  # Images

  # For some reason (current or previous bug?) some streams have a 404 image
  # Trying to clean up and reuse former one
  def reattach_image_of_stream_with_404_image() do
    get_streams_with_404_image()
    |> Enum.map(fn %{id: id, img: _img} -> ImageImporter.find_image_for_stream(id) end)
    |> Enum.each(&update_stream_with_image/1)
  end

  defp get_streams_with_404_image() do
    from(s in Stream,
      where: not is_nil(s.img) and s.enabled == true,
      select: %{id: s.id, img: s.img}
    )
    |> Repo.all()
    |> Enum.filter(fn s ->
      "#{Application.get_env(:progradio_api, :image_path)}stream/#{s.img}"
      |> File.exists?() == false
    end)
  end

  # If a stream has no image (usually from a dead link) we reuse the former one if any,
  # (as we don't delete previous images)
  def reattach_image_of_stream_with_no_image() do
    get_streams_with_no_image()
    |> Enum.map(fn s -> ImageImporter.find_image_for_stream(s) end)
    |> Enum.filter(fn {_stream_id, filename} -> filename != nil end)
    |> Enum.each(&update_stream_with_image/1)
  end

  defp get_streams_with_no_image() do
    from(s in Stream,
      where: is_nil(s.img),
      select: s.id
    )
    |> Repo.all()
  end

  defp update_stream_with_image({stream_id, filename}) do
    query =
      from s in Stream,
        where: s.id == ^stream_id

    Repo.update_all(query, set: [img: filename])
  end
end
