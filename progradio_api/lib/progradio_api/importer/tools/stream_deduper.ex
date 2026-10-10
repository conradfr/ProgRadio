defmodule ProgRadioApi.Importer.Deduper do
  @moduledoc """
  Finds the stream that already exists for a stream about to be imported.

  The criteria, in the order they are checked:

    * same stream: same `source` and same `external_id`
    * duplicate: same stream url and same country. The url is compared to both the
      stream url and the original stream url of the existing streams, one is enough.
      The query of the url is ignored: `https://host/radio.mp3?property=streema` is
      `https://host/radio.mp3`. So is what follows a `;` at the end, a shoutcast server
      does not read it: `http://host:8000/;stream.mp3` is `http://host:8000/;`.
      On streamtheworld a station has a mount per codec and per protocol, they are all
      the same url: `XHFOFM.mp3` is `XHFOFMAAC.aac`, `XHFOFM_SC` and `XHFOFMAAC_SC`.
      On laut.fm a station has two urls, and a playlist: `stream.laut.fm/kids_radio` is
      `kidsradio.stream.laut.fm/kids_radio` and `stream.laut.fm/kids_radio.m3u`.
    * duplicate: very close name and same country. Only the frequency and the band are
      ignored, wherever they are in the name: `103.2 FM La radio` is `La radio 103.2 FM`.
    * duplicate: same website, same country and same name once written in one word.
      `Atlantica Breda` is `Atlanticabreda` when both are on `atlanticabreda.nl`.
      The `Radio` a name ends with is left out: `Suffolk Sound` is `Suffolk Sound Radio`
      when both are on `suffolksound.com`.
    * duplicate, in the United States, Canada and Mexico only: same call sign, same
      frequency and same website. `Cool 100.1 - CHCQ` is `CHCQ-FM 100.1 "Cool 100"
      Belleville, ON` when both are on `cool100.ca`.

  Anything else in the name makes it another station: `La Radio Funk` is a variant of
  `La Radio`, not a duplicate. So are `Nostalgie+` and `Nostalgie`.

  A name on its own is not always enough, so a name match is refused when:

    * both names carry a frequency and none is shared - `Cidadania 87.9` is not
      `Cidadania 98.7`
    * both names carry a band and it is not the same - `Nacional AM` is not `Nacional FM`
    * more than `@max_same_name` streams of the country share the name. It is then the
      name of many local stations (`Cidade`, `Cultura`) and not of one, so only a
      shared frequency makes a duplicate.

  The same goes for an url: when more than `@max_same_url` different urls only differ by
  their query, the query is what selects the station (`https://host/index.php?port=8004`)
  and only the same query makes a duplicate.

  A call sign is not enough either. A station keeps it when it changes of format or of
  owner, and a word can look like one (`KISS`, `KOOL`). So a call sign match is refused when:

    * no frequency is shared, or the bands are not the same. When the name of the stream
      to import has no frequency, the one given apart by its source is used.
    * the websites have neither the same host nor the same domain name
      (`listen.cool100.ca` and `cool100.ca`)
    * more than `@max_same_website` streams of the country are on that website. It is
      then a platform or a network (`facebook.com`, `iheart.com`) and not the website
      of the station.
    * the names are not of the same HD channel - `KNTU-HD2` is not `KNTU-HD1`
    * more than `@max_same_call_sign` streams of the country carry the call sign

  A name in one word is only compared between streams of the same website, two stations
  can have it - `Rádio 93FM` and `Rádio 93 FM` are two stations, each with its website.
  The website is compared as for a call sign: the host or the domain name, and not when
  it is the website of more than `@max_same_website` streams. The name must also be of
  `@min_joined_name_length` letters and digits at least. When the names only differ by
  the `Radio` one of them ends with, `@min_name_length` is enough for what is left of it:
  `m2o` is `m2o Radio`, the way the name is split is then not what makes them the same.

  A duplicate is only searched among the streams that can be listened to: enabled, not
  banned and not redirected. The same stream is returned whatever its state.
  """

  import Ecto.Query, only: [from: 2]

  alias ProgRadioApi.Repo
  alias ProgRadioApi.Stream

  # above this many streams sharing a name in one country, the name does not identify a station
  @max_same_name 3
  # above this many urls only differing by their query, the query is what identifies the station
  @max_same_url 3
  @url_candidates_limit 50
  # below this a name is too short to be compared ("FM", "1")
  @min_name_length 3
  # what a frequency and a band can add to a name: "La radio" / "La radio - 103.20 MHz (FM)"
  @name_length_margin 24
  @name_candidates_limit 500
  # above this many streams carrying a call sign in one country, it is a word and not a call sign
  @max_same_call_sign 3
  # above this many streams of a country on a website, it is not the website of a station
  @max_same_website 10
  @website_candidates_limit 100
  # below this a name written in one word is too short to be compared ("fm1", "us105")
  @min_joined_name_length 6

  @doc """
  Expects the values of the stream to import: `:source`, `:external_id`, `:stream_url`,
  `:name`, `:country_code` and `:website`. A missing value only skips the criteria that
  need it. `:original_stream_url` can be given too, when it is not the stream url.
  So can `:frequency` and `:band` (`"97.5"` and `"FM"`), when the source has them
  apart from the name.

  Returns `{:same, stream}`, `{:duplicate, stream}` or `nil`.
  """
  def find_existing_stream(%{} = attrs) do
    find_same_stream(attrs) || find_duplicate_by_url(attrs) || find_duplicate_by_name(attrs) ||
      find_duplicate_by_website(attrs) || find_duplicate_by_call_sign(attrs)
  end

  defp find_same_stream(%{source: source, external_id: external_id})
       when is_binary(source) and not is_nil(external_id) and external_id != "" do
    from(s in Stream,
      where: s.source == ^source and s.external_id == ^to_string(external_id),
      order_by: [desc: s.score],
      limit: 1
    )
    |> Repo.one()
    |> tag(:same)
  end

  defp find_same_stream(_attrs), do: nil

  defp find_duplicate_by_url(%{stream_url: stream_url, country_code: country_code} = attrs)
       when is_binary(stream_url) and is_binary(country_code) do
    [stream_url, Map.get(attrs, :original_stream_url)]
    |> Enum.filter(&is_binary/1)
    |> Enum.uniq()
    |> Enum.find_value(&find_duplicate_with_url(&1, country_code))
  end

  defp find_duplicate_by_url(_attrs), do: nil

  defp find_duplicate_with_url(url, country_code) do
    case url_variants(url) do
      [] ->
        nil

      variants ->
        {_url, query} = split_url(url)

        candidates =
          from(s in with_url(eligible(country_code), variants),
            order_by: [desc: s.score],
            limit: @url_candidates_limit
          )
          |> Repo.all()

        same_query = Enum.find(candidates, &has_url?(&1, variants, query))

        cond do
          same_query != nil -> same_query
          candidates == [] -> nil
          # on streamtheworld and on laut.fm the station is in the path, never in the query
          station_keys(url_key(url)) != [] -> List.first(candidates)
          query_identifies_station?(variants) -> nil
          true -> List.first(candidates)
        end
        |> tag(:duplicate)
    end
  end

  # one of the urls of the stream is the url, with the same query
  defp has_url?(%Stream{} = stream, variants, query) do
    [stream.stream_url, stream.original_stream_url]
    |> Enum.filter(&is_binary/1)
    |> Enum.map(&split_url/1)
    |> Enum.any?(fn {url, stream_query} -> stream_query == query and url in variants end)
  end

  # The streams having one of the urls as stream url or as original stream url, once
  # reduced as split_url/1 does. There is an index for both regexp_replace(...).
  defp with_url(query, variants) do
    from(s in query,
      where:
        fragment(
          "regexp_replace(?, '(/*;[^/\\?]*)\\?/*([\\?].*)\\?$', '') = ANY(?)",
          s.stream_url,
          type(^variants, {:array, :string})
        ) or
          fragment(
            "regexp_replace(?, '(/*;[^/\\?]*)\\?/*([\\?].*)\\?$', '') = ANY(?)",
            s.original_stream_url,
            type(^variants, {:array, :string})
          )
    )
  end

  # all the streams are counted, whatever their country and their state
  defp query_identifies_station?(variants) do
    from(s in with_url(Stream, variants),
      distinct: true,
      select: [s.stream_url, s.original_stream_url],
      limit: @url_candidates_limit
    )
    |> Repo.all()
    |> List.flatten()
    |> Enum.filter(&is_binary/1)
    |> Enum.map(&split_url/1)
    |> Enum.filter(fn {url, _query} -> url in variants end)
    |> Enum.uniq_by(fn {_url, query} -> query end)
    |> length()
    |> Kernel.>(@max_same_url)
  end

  defp find_duplicate_by_name(%{name: name, country_code: country_code})
       when is_binary(name) and is_binary(country_code) do
    incoming = parse_name(name)

    if String.length(incoming.core) >= @min_name_length do
      same_name =
        incoming
        |> name_candidates(country_code)
        |> Enum.map(&Map.put(&1, :parsed, parse_name(&1.name)))
        |> Enum.filter(&(&1.parsed.core == incoming.core))

      generic_name? = length(same_name) > @max_same_name

      duplicates =
        Enum.filter(same_name, fn %{parsed: parsed} ->
          frequencies_match? =
            if generic_name? do
              shared?(incoming.frequencies, parsed.frequencies)
            else
              not conflict?(incoming.frequencies, parsed.frequencies)
            end

          frequencies_match? and not conflict?(incoming.bands, parsed.bands)
        end)

      case Enum.max_by(duplicates, &(&1.score || 0), fn -> nil end) do
        nil -> nil
        %{id: id} -> Stream |> Repo.get(id) |> tag(:duplicate)
      end
    end
  end

  defp find_duplicate_by_name(_attrs), do: nil

  defp find_duplicate_by_website(%{name: name, country_code: country_code, website: website})
       when is_binary(name) and is_binary(country_code) and is_binary(website) do
    host = website_host(website)

    comparable? =
      String.length(join_name(name)) >= @min_joined_name_length or
        String.length(station_name(name)) >= @min_name_length

    if host != nil and comparable? do
      # there is a trigram index for the website
      duplicates =
        from(s in eligible(country_code),
          where: ilike(s.website, ^"%#{website_domain(host) || host}%"),
          limit: @website_candidates_limit
        )
        |> Repo.all()
        |> Enum.filter(fn stream ->
          same_joined_name?(name, stream.name) and
            shared_website(host, website_host(stream.website)) != nil
        end)

      with %Stream{} = duplicate <- Enum.max_by(duplicates, &(&1.score || 0), fn -> nil end),
           shared = shared_website(host, website_host(duplicate.website)),
           false <- website_of_many?(shared, country_code) do
        {:duplicate, duplicate}
      else
        _ -> nil
      end
    end
  end

  defp find_duplicate_by_website(_attrs), do: nil

  # The names are the same in one word, or they are once the "Radio" one of them ends
  # with is left out: "Suffolk Sound" and "Suffolk Sound Radio".
  defp same_joined_name?(name, other_name) do
    joined = join_name(name)

    if joined == join_name(other_name) do
      String.length(joined) >= @min_joined_name_length
    else
      station = station_name(name)

      station == station_name(other_name) and String.length(station) >= @min_name_length
    end
  end

  # the name in one word without the "Radio" it ends with: "Suffolk Sound Radio" -> "suffolksound"
  defp station_name(name) do
    name
    |> String.downcase()
    |> unaccent()
    |> String.replace(~r/[^\p{L}\p{N}+]+radio[^\p{L}\p{N}+]*$/u, "")
    |> join_name()
  end

  # The name in one word, whatever the way it is split and punctuated:
  # "Atlantica Breda", "Atlantica-Breda", "Atlanticabreda" -> "atlanticabreda"
  # The "+" is kept, "Nostalgie+" is not "Nostalgie".
  defp join_name(name) do
    name
    |> String.downcase()
    |> unaccent()
    |> String.replace(~r/[^\p{L}\p{N}+]+/u, "")
  end

  defp find_duplicate_by_call_sign(
         %{name: name, country_code: country_code, website: website} = attrs
       )
       when is_binary(name) and is_binary(country_code) and is_binary(website) do
    country_code = String.upcase(country_code)
    incoming = name |> parse_name() |> with_given_frequency(attrs)
    host = website_host(website)

    if host != nil and MapSet.size(incoming.frequencies) > 0 do
      name
      |> call_signs(country_code)
      |> Enum.find_value(fn call_sign ->
        # there is a trigram index for the name
        carriers =
          from(s in eligible(country_code),
            where: like(s.name, ^"%#{call_sign}%"),
            limit: @name_candidates_limit
          )
          |> Repo.all()
          |> Enum.filter(&(call_sign in call_signs(&1.name, country_code)))

        duplicates =
          Enum.filter(carriers, fn stream ->
            parsed = parse_name(stream.name)

            shared?(incoming.frequencies, parsed.frequencies) and
              not conflict?(incoming.bands, parsed.bands) and
              hd_channels(name) == hd_channels(stream.name) and
              shared_website(host, website_host(stream.website)) != nil
          end)

        with true <- length(carriers) <= @max_same_call_sign,
             %Stream{} = duplicate <- Enum.max_by(duplicates, &(&1.score || 0), fn -> nil end),
             shared = shared_website(host, website_host(duplicate.website)),
             false <- website_of_many?(shared, country_code) do
          {:duplicate, duplicate}
        else
          _ -> nil
        end
      end)
    end
  end

  defp find_duplicate_by_call_sign(_attrs), do: nil

  # The frequency of a name without one is the one its source gives apart, if any.
  # Only a frequency of its band is taken: "790" and "FM", "Online only" are not.
  defp with_given_frequency(parsed, attrs) do
    frequency = attrs |> Map.get(:frequency) |> to_string() |> String.trim()
    band = attrs |> Map.get(:band) |> to_string() |> String.downcase()

    with true <- MapSet.size(parsed.frequencies) == 0,
         true <- band in ["fm", "am"],
         {_value, ""} <- frequency |> String.replace(",", ".") |> Float.parse(),
         value when value != nil <- to_frequency(frequency, band) do
      %{parsed | frequencies: MapSet.new([value]), bands: MapSet.put(parsed.bands, band)}
    else
      _ -> parsed
    end
  end

  # The call signs in a name, as they are written by the sources: in upper case and on
  # their own ("CHCQ", "CHCQ-FM"). Each country has its own prefixes.
  defp call_signs(name, country_code) do
    case call_sign_regex(country_code) do
      nil -> []
      regex -> regex |> Regex.scan(name) |> List.flatten() |> Enum.uniq()
    end
  end

  defp call_sign_regex("US"), do: ~r/(?<![\p{L}\p{N}])[KW][A-Z]{3}(?![\p{L}\p{N}])/u
  defp call_sign_regex("CA"), do: ~r/(?<![\p{L}\p{N}])C[BFHIJK][A-Z]{2}(?![\p{L}\p{N}])/u
  defp call_sign_regex("MX"), do: ~r/(?<![\p{L}\p{N}])X[EH][A-ZÑ]{1,4}(?![\p{L}\p{N}])/u
  defp call_sign_regex(_country_code), do: nil

  # "KNTU-HD2", "HD 3": another programme of the station. HD1 is the main one.
  defp hd_channels(name) do
    ~r/\bHD[ -]?([2-9])\b/iu
    |> Regex.scan(name)
    |> Enum.map(fn [_match, channel] -> channel end)
    |> MapSet.new()
  end

  # what two websites share: the host, or at least the domain name
  defp shared_website(host, host) when is_binary(host), do: host

  defp shared_website(host, other_host) when is_binary(host) and is_binary(other_host) do
    domain = website_domain(host)

    if domain != nil and domain == website_domain(other_host), do: domain
  end

  defp shared_website(_host, _other_host), do: nil

  # the streams of the country on the website, or on a subdomain of it
  defp website_of_many?(website, country_code) do
    from(s in eligible(country_code),
      where: ilike(s.website, ^"%#{website}%"),
      select: s.website,
      limit: @website_candidates_limit
    )
    |> Repo.all()
    |> Enum.count(fn stream_website ->
      host = website_host(stream_website)

      host == website or (host != nil and String.ends_with?(host, "." <> website))
    end)
    |> Kernel.>(@max_same_website)
  end

  # "https://www.cool100.ca/listen?live=1" -> "cool100.ca"
  defp website_host(website) when is_binary(website) do
    host =
      website
      |> String.trim()
      |> String.downcase()
      |> String.replace(~r{^https?://}, "")
      |> String.replace(~r{[/?#:].*$}s, "")
      |> String.replace(~r/^www\./, "")

    if String.contains?(host, "."), do: host
  end

  defp website_host(_website), do: nil

  # "listen.cool100.ca" -> "cool100.ca", "radio.grupo.com.mx" -> "grupo.com.mx"
  # nil when there is none, an ip address has no domain name
  defp website_domain(host) do
    if Regex.match?(~r/^[\d.]+$/, host) do
      nil
    else
      case host |> String.split(".") |> Enum.reverse() do
        # "com.mx", "gob.mx", "qc.ca": the domain name is one level below
        [tld, second, name | _]
        when byte_size(tld) == 2 and
               (byte_size(second) == 2 or
                  second in ["com", "org", "net", "edu", "gob", "gov", "mil", "co", "ac"]) ->
          Enum.join([name, second, tld], ".")

        [tld, second | _] ->
          second <> "." <> tld

        _ ->
          nil
      end
    end
  end

  # The streams of the country whose name has every word of the incoming name. This is
  # only a first selection, the names are then compared once parsed.
  defp name_candidates(%{core: core}, country_code) do
    patterns =
      core
      |> String.split(~r/[^\p{L}\p{N}]+/u, trim: true)
      |> Enum.uniq()
      |> Enum.map(&"%#{&1}%")

    max_length = String.length(core) + @name_length_margin

    if patterns == [] do
      []
    else
      from(s in eligible(country_code),
        where:
          fragment("unaccent(lower(?)) LIKE ALL(?)", s.name, type(^patterns, {:array, :string})),
        where: fragment("char_length(?)", s.name) <= ^max_length,
        order_by: fragment("char_length(?)", s.name),
        limit: @name_candidates_limit,
        select: %{id: s.id, name: s.name, score: s.score}
      )
      |> Repo.all()
    end
  end

  defp eligible(country_code) do
    from(s in Stream,
      where:
        s.country_code == ^String.upcase(country_code) and s.enabled == true and
          s.banned == false and s.closed == false and is_nil(s.redirect_to)
    )
  end

  defp tag(nil, _type), do: nil
  defp tag(%Stream{} = stream, type), do: {type, stream}

  # both sides say something and they do not agree
  defp conflict?(a, b) do
    MapSet.size(a) > 0 and MapSet.size(b) > 0 and MapSet.disjoint?(a, b)
  end

  defp shared?(a, b), do: not MapSet.disjoint?(a, b)

  # Normalisation

  # The stream url is stored as given by the source, so we look for the forms the same
  # url is usually written in: http or https, with or without www.
  # The variants are reduced as split_url/1 does, as are the stored urls they are compared to.
  defp url_variants(stream_url) do
    {url, _query} = split_url(stream_url)

    case url_key(stream_url) do
      "" ->
        []

      key ->
        variants =
          for key <- [key | station_keys(key)],
              scheme <- ["http://", "https://"],
              www <- ["", "www."] do
            scheme <> www <> key
          end

        Enum.uniq([url | variants])
    end
  end

  # the url reduced by split_url/1, without its protocol and "www.", the host in lower case
  defp url_key(stream_url) do
    {url, _query} = split_url(stream_url)

    key = String.replace(url, ~r{^https?://(www\.)?}i, "")

    case String.split(key, "/", parts: 2) do
      [host, path] -> String.downcase(host) <> "/" <> path
      [host] -> String.downcase(host)
    end
  end

  # the other urls of the station, on the platforms where a station has several
  defp station_keys(key), do: streamtheworld_keys(key) ++ lautfm_keys(key)

  # The mounts of a station on streamtheworld. They are named after the station, then
  # "AAC" when it is not the mp3 one, "_SC" for the shoutcast protocol and an extension:
  # "XHFOFM.mp3", "XHFOFMAAC.aac", "XHFOFM_SC", "XHFOFMAAC_SC", "XHFOFM.flv"...
  # Any other mount of the station ("XHFOFM_ADP", "XHFOFMAAC48") is left as another url.
  defp streamtheworld_keys(key) do
    prefix = "playerservices.streamtheworld.com/api/livestream-redirect/"

    with true <- String.starts_with?(key, prefix),
         mount = key |> String.replace_prefix(prefix, "") |> String.trim_leading("/"),
         false <- String.contains?(mount, "/"),
         station when station != "" <-
           mount
           |> String.upcase()
           |> String.replace(~r/\.(AAC|MP3|FLV|M3U8|PLS)$/, "")
           |> String.replace(~r/_SC$/, "")
           |> String.replace(~r/AAC$/, "") do
      for codec <- ["", "AAC"],
          protocol <- ["", "_SC"],
          extension <- ["", ".mp3", ".aac", ".flv", ".m3u8", ".pls"] do
        prefix <> station <> codec <> protocol <> extension
      end
    else
      _ -> []
    end
  end

  # The urls of a station on laut.fm: "stream.laut.fm/kids_radio" and, on a host named
  # after the station, "kidsradio.stream.laut.fm/kids_radio". The first one is also given
  # as a playlist, "stream.laut.fm/kids_radio.m3u".
  defp lautfm_keys(key) do
    station =
      case String.split(key, "/") do
        ["stream.laut.fm", path] ->
          path |> String.downcase() |> String.replace(~r/\.m3u$/, "")

        [host, path] ->
          path = String.downcase(path)

          if host == lautfm_host(path), do: path

        _ ->
          nil
      end

    if station in [nil, ""] do
      []
    else
      [
        "stream.laut.fm/" <> station,
        "stream.laut.fm/" <> station <> ".m3u",
        lautfm_host(station) <> "/" <> station
      ]
    end
  end

  # "kids_radio" -> "kidsradio.stream.laut.fm", "-dj_19" -> "dj19.stream.laut.fm"
  defp lautfm_host(station) do
    (station |> String.replace("_", "") |> String.trim("-")) <> ".stream.laut.fm"
  end

  # The url without what does not select the stream, and its query:
  # the trailing "/" and what follows a ";" at the end, ignored by the shoutcast servers.
  # The same is done to the stored urls by the regexp_replace of with_url/2.
  #
  # "http://host:8000/;stream.mp3?id=1" -> {"http://host:8000", "id=1"}
  defp split_url(stream_url) do
    {url, query} =
      case stream_url |> String.trim() |> String.split("?", parts: 2) do
        [url, query] -> {url, query}
        [url] -> {url, ""}
      end

    {String.replace(url, ~r{(/*;[^/]*)?/*$}, "", global: false), query}
  end

  # Splits a name in what identifies the station (`core`) and what only says where it is
  # broadcasted (`frequencies` and `bands`).
  #
  # "103.2 FM La Radio" -> %{core: "la radio", frequencies: [103.2], bands: ["fm"]}
  defp parse_name(name) do
    name =
      name
      |> String.downcase()
      |> unaccent()
      # codec and broadcast standard, not a "+" channel
      |> String.replace(~r/\b(aac|dab)\+/u, "\\1")

    {name, frequencies} =
      {name, []}
      # "1040 khz", "103.2 mhz"
      |> take_frequencies(~r/(?<![\d.,])(\d{2,4}(?:[.,]\d{1,2})?)\s*[km]hz\b/u, fn [number] ->
        to_frequency(number, nil)
      end)
      # "103.2", "103,20"
      |> take_frequencies(~r/(?<![\d.,])(\d{2,3}[.,]\d{1,2})(?!\d)/u, fn [number] ->
        to_frequency(number, "fm")
      end)
      # "910 am", "104 fm"
      |> take_frequencies(~r/(?<![\d.,])(\d{2,4})\s*(fm|am)\b/u, fn [number, band] ->
        to_frequency(number, band)
      end)
      # "am 910", "fm 104" but not "fm 80's"
      |> take_frequencies(~r/\b(fm|am)\s*(\d{2,4})(?![\d'’\p{L}])/u, fn [band, number] ->
        to_frequency(number, band)
      end)

    # "am" is also a word ("Radio am See"), it is only a band at the start or the end of the name
    named_bands =
      Regex.scan(~r/\bfm\b|^\W*am\b|\bam\W*$/u, name)
      |> Enum.map(fn [match] -> String.replace(match, ~r/\W/u, "") end)

    core =
      name
      |> String.replace(~r/\bfm\b|^\W*am\b|\bam\W*$/u, " ")
      |> String.replace("+", " + ")
      |> String.replace(~r/[^\p{L}\p{N}+]+/u, " ")
      |> String.trim()

    %{
      core: core,
      frequencies: MapSet.new(frequencies),
      bands: MapSet.new(named_bands ++ Enum.map(frequencies, &frequency_band/1))
    }
  end

  # removes from the name what the regex finds when it is a frequency
  defp take_frequencies({name, frequencies}, regex, to_frequency) do
    regex
    |> Regex.scan(name)
    |> Enum.reduce({name, frequencies}, fn [match | captures], {name, frequencies} ->
      case to_frequency.(captures) do
        nil -> {name, frequencies}
        frequency -> {String.replace(name, match, " ", global: false), [frequency | frequencies]}
      end
    end)
  end

  # nil when the number is not in the band, so "Radio 21 FM" keeps its 21
  defp to_frequency(number, band) do
    {value, _} = number |> String.replace(",", ".") |> Float.parse()

    in_band? =
      case band do
        "fm" -> value >= 76.0 and value <= 108.0
        "am" -> value >= 520.0 and value <= 1710.0
        _ -> true
      end

    if in_band?, do: value
  end

  defp frequency_band(frequency) when frequency <= 108.0, do: "fm"
  defp frequency_band(_frequency), do: "am"

  defp unaccent(string) do
    string
    |> String.normalize(:nfd)
    |> String.replace(~r/\p{Mn}/u, "")
    # not decomposed by the normalisation
    |> String.replace(["ß", "æ", "œ", "ø", "đ", "ł", "ı"], fn
      "ß" -> "ss"
      "æ" -> "ae"
      "œ" -> "oe"
      "ø" -> "o"
      "đ" -> "d"
      "ł" -> "l"
      "ı" -> "i"
    end)
  end
end
