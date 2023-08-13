defmodule ProgRadioApi.Importer.StreamsImporter.RadioBrowser do
  import Ecto.Query, only: [from: 2]
  alias Ecto.Multi
  alias ProgRadioApi.Repo
  alias ProgRadioApi.{Stream, StreamOverloading}
  alias ProgRadioApi.Streams
  alias ProgRadioApi.Importer.ImageImporter
  alias ProgRadioApi.Importer.StreamsImporter.StreamMatcher

  # TODO unbundle if we diversify streams sources

  @servers_dns "all.api.radio-browser.info"
  @api_all_radios "/stations"

  @max_concurrency 4
  @task_timeout 1_000_000

  def import(stream_id \\ nil)

  def import(stream_id) when is_binary(stream_id) do
    get_one_random_server()
    |> get_radios(stream_id)
    |> format()
    |> import_images()
    |> store_one()

    :ok
  end

  def import(_stream_id) do
    get_one_random_server()
    |> get_radios()
    |> format()
    |> import_images()
    |> delete_images_from_removed_stations()
    |> store()

    overload_disabled()
    reattach_image_of_stream_with_no_image()
    find_redirect_for_disabled_streams()
    StreamMatcher.match()
    :ok
  end

  def import_recently_updated() do
    Streams.get_recently_overload_updated_ids()
    |> Enum.each(fn stream_id when is_binary(stream_id) ->
      __MODULE__.import(stream_id)
    end)
  end

  # Data

  defp get_radios(host, stream_id \\ nil) do
    # ?limit=20&offset=7500
    url =
      if stream_id != nil and is_binary(stream_id) do
        "https://#{host}/json/#{@api_all_radios}/byuuid/#{stream_id}"
      else
        "https://#{host}/json/#{@api_all_radios}"
      end

    HTTPoison.get!(
      url,
      [{"User-Agent", "programmes-radio.com"}]
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
  end

  defp format(data) do
    stream_overloading = Repo.all(StreamOverloading)

    data
    |> Enum.map(fn stream ->
      id = Map.get(stream, "stationuuid")

      overloading =
        case Enum.find(stream_overloading, fn s -> s.id == id end) do
          nil -> %{}
          data -> data
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
          nil -> true
        end

      %{
        id: id,
        code_name: id,
        name: Map.get(overloading, :name) || name,
        img_url: Map.get(overloading, :img) || img_url,
        img: nil,
        website: Map.get(overloading, :website) || website,
        stream_url: Map.get(overloading, :stream_url) || stream_url,
        tags: Map.get(stream, "tags"),
        country_code: Map.get(overloading, :country_code) || country_code,
        language: Map.get(stream, "language"),
        votes: Map.get(stream, "votes"),
        clicks_last_24h: Map.get(stream, "clickcount"),
        enabled: enabled
      }
    end)
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

  # Store

  # note: multi has just been copied from below function to reuse functions
  defp store_one(streams) do
    multi_upsert =
      Multi.new()
      |> upsert_streams(streams)

    Repo.transaction(multi_upsert, timeout: :infinity)
  end

  defp store({ids_to_keep, streams} = _args) do
    multi_delete =
      Multi.new()
      |> delete_streams(ids_to_keep)

    multi_upsert =
      Multi.new()
      |> upsert_streams(streams)

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
            country_code: s.country_code,
            tags: s.tags,
            website: s.website,
            language: s.language,
            stream_url: s.stream_url,
            votes: s.votes,
            clicks_last_24h: s.clicks_last_24h,
            enabled: s.enabled
          ]
        ],
        conflict_target: :id
      )
    end)
  end

  @spec delete_streams(Multi.t(), list()) :: any
  defp delete_streams(multi, to_not_delete) do
    ids_to_keep =
      from(so in StreamOverloading,
        where: so.enabled == true,
        select: so.id
      )
      |> Repo.all()
      |> Enum.map(fn stream_id ->
        Ecto.UUID.dump!(stream_id)
      end)
      |> Enum.concat(to_not_delete)

    # soft delete
    q =
      from(
        s in "stream",
        where: s.id not in ^ids_to_keep,
        update: [set: [enabled: false]]
      )

    Multi.update_all(multi, :update_enabled, q, [])
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
          language: s.language,
          votes: s.votes,
          clicks_last_24h: s.clicks_last_24h,
          name: fragment("COALESCE(?, ?)", so.name, s.name),
          img_url: so.img,
          img: s.img,
          stream_url: fragment("COALESCE(?, ?)", so.stream_url, s.stream_url),
          country_code: fragment("COALESCE(?, ?)", so.country_code, s.country_code),
          enabled: fragment("COALESCE(?, ?)", so.enabled, s.enabled),
          website: fragment("COALESCE(?, ?)", so.website, s.website)
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
