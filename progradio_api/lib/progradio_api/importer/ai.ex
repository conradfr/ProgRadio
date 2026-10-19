defmodule ProgRadioApi.Importer.Ai do
  require Logger
  import Ecto.Query, only: [from: 2]
  alias Ecto.Multi
  alias ProgRadioApi.Repo
  alias ProgRadioApi.Stream, as: ProgRadioStream
  alias ProgRadioApi.StreamOverloading
  alias OpenaiEx.Chat
  alias OpenaiEx.ChatMessage

  @default_batch_size 200

  # ProgRadioApi.Importer.Ai.update_description(1000)
  # ProgRadioApi.Importer.Ai.update_tags(1000)
  # ProgRadioApi.Importer.Ai.update_genres(1000)
  # ProgRadioApi.Importer.Ai.update_country_code(1000)

  # ---------- PUBLIC ----------

  def update_description(limit \\ 1, offset \\ 0, batch_size \\ @default_batch_size) do
    openai =
      OpenaiEx._for_azure(
        System.fetch_env!("AZURE_GPT_API_KEY"),
        System.fetch_env!("AZURE_GPT_BASE_URL"),
        System.fetch_env!("AZURE_GPT_DEPLOYMENT"),
        System.fetch_env!("AZURE_GPT_VERSION")
      )

    query =
      from s in ProgRadioStream,
        select: s,
        #            fragment("? not ilike '%.m3u8%'", s.stream_url) and
        where:
          s.enabled == true and s.banned == false and s.closed == false and is_nil(s.redirect_to) and
            not is_nil(s.country_code) and (is_nil(s.description) or s.description == ""),
        order_by: [desc: s.score],
        offset: ^offset,
        limit: ^limit

    Repo.transaction(
      fn ->
        query
        |> Repo.stream(max_rows: 100)
        |> Stream.chunk_every(batch_size)
        |> Stream.each(fn batch ->
          process_description_batch(batch, openai)
        end)
        |> Stream.run()
      end,
      timeout: :infinity
    )
  end

  def update_tags(limit \\ 1, offset \\ 0, batch_size \\ @default_batch_size) do
    openai =
      OpenaiEx._for_azure(
        System.fetch_env!("AZURE_GPT_API_KEY"),
        System.fetch_env!("AZURE_GPT_BASE_URL"),
        System.fetch_env!("AZURE_GPT_DEPLOYMENT"),
        System.fetch_env!("AZURE_GPT_VERSION")
      )

    query =
      from s in ProgRadioStream,
        select: s,
        #            fragment("? not ilike '%.m3u8%'", s.stream_url) and
        where:
          s.enabled == true and s.banned == false and s.closed == false and is_nil(s.redirect_to) and
            not is_nil(s.country_code) and (is_nil(s.tags) or s.tags == ""),
        order_by: [desc: s.score],
        offset: ^offset,
        limit: ^limit

    Repo.transaction(
      fn ->
        query
        |> Repo.stream(max_rows: 100)
        |> Stream.chunk_every(batch_size)
        |> Stream.each(fn batch ->
          process_tags_batch(batch, openai)
        end)
        |> Stream.run()
      end,
      timeout: :infinity
    )
  end

  def update_genres(limit \\ 1, offset \\ 0, batch_size \\ @default_batch_size) do
    openai =
      OpenaiEx._for_azure(
        System.fetch_env!("AZURE_GPT_API_KEY"),
        System.fetch_env!("AZURE_GPT_BASE_URL"),
        System.fetch_env!("AZURE_GPT_DEPLOYMENT"),
        System.fetch_env!("AZURE_GPT_VERSION")
      )

    query =
      from s in ProgRadioStream,
        select: s,
        #            fragment("? not ilike '%.m3u8%'", s.stream_url) and
        where:
          s.enabled == true and s.banned == false and s.closed == false and is_nil(s.redirect_to) and
            not is_nil(s.country_code) and (is_nil(s.genres) or s.genres == ""),
        order_by: [desc: s.score],
        offset: ^offset,
        limit: ^limit

    Repo.transaction(
      fn ->
        query
        |> Repo.stream(max_rows: 100)
        |> Stream.chunk_every(batch_size)
        |> Stream.each(fn batch ->
          process_genres_batch(batch, openai)
        end)
        |> Stream.run()
      end,
      timeout: :infinity
    )
  end

  def update_country_code(limit \\ 1, offset \\ 0, batch_size \\ @default_batch_size) do
    openai =
      OpenaiEx._for_azure(
        System.fetch_env!("AZURE_GPT_API_KEY"),
        System.fetch_env!("AZURE_GPT_BASE_URL"),
        System.fetch_env!("AZURE_GPT_DEPLOYMENT"),
        System.fetch_env!("AZURE_GPT_VERSION")
      )

    query =
      from s in ProgRadioStream,
        select: s,
        where:
          s.enabled == true and s.banned == false and s.closed == false and is_nil(s.redirect_to) and
            (is_nil(s.country_code) or s.country_code == ""),
        order_by: [desc: s.score],
        offset: ^offset,
        limit: ^limit

    Repo.transaction(
      fn ->
        query
        |> Repo.stream(max_rows: 100)
        |> Stream.chunk_every(batch_size)
        |> Stream.each(fn batch ->
          process_country_code_batch(batch, openai)
        end)
        |> Stream.run()
      end,
      timeout: :infinity
    )
  end

  # ---------- PRIVATE ----------

  defp process_description_batch(batch, openai) do
    changesets =
      batch
      |> Enum.map(fn stream_record ->
        {stream_record, fetch_description(stream_record, openai)}
      end)
      |> Enum.filter(fn {_record, description} -> description != nil end)
      |> Enum.map(fn {record, description} ->
        ProgRadioStream.changeset_description(record, %{description: description})
      end)

    case update_batch(changesets) do
      {:ok, count} ->
        Logger.info("Successfully updated #{count} records in batch")

      {:error, reason} ->
        Logger.error("Failed to update batch: #{inspect(reason)}")
    end
  end

  defp fetch_description(e, openai) do
    prompt =
      "Describe in three sentences maximum the radio whose name is given by the chat input. If not sure about the correct radio, use the country code given in the chat input to select the correct one. You can use its website if it's given in the chat input, Wikipedia and then web search if needed (prioritized in that order). Answer an empty string if you don't find information (and absolutely not that you didn't find information). Your answer must be in the most appropriate language for the country code given in the chat input, taking also into account the language given in the input chat (if any), Translate it if you need."

    params = """
    radio: #{e.name}
    website: #{if not is_nil(e.website), do: e.website, else: "none"}
    country code: #{e.country_code}
    language: #{if not is_nil(e.language), do: e.language, else: "unknown"}
    """

    chat_req =
      Chat.Completions.new(
        model: "gpt-4.1-mini",
        messages: [
          ChatMessage.system(prompt),
          ChatMessage.user(params)
        ]
      )

    case Chat.Completions.create(openai, chat_req) do
      {:ok, %{"choices" => [%{"message" => %{"content" => content}} | _]}}
      when is_binary(content) and content != "" and content != "\"\"" ->
        Logger.info("Result found for radio #{e.name} - #{e.id}: #{String.slice(content, 0..25)}")

        content

      _ ->
        Logger.info("No result for radio #{e.name}- #{e.id}")
        nil
    end
  end

  defp process_tags_batch(batch, openai) do
    changesets =
      batch
      |> Enum.map(fn stream_record ->
        {stream_record, fetch_tags(stream_record, openai)}
      end)
      |> Enum.filter(fn {_record, tags} -> tags != nil end)
      |> Enum.map(fn {record, tags} ->
        ProgRadioStream.changeset_tags(record, %{tags: tags})
      end)

    case update_batch(changesets) do
      {:ok, count} ->
        Logger.info("Successfully updated #{count} records in batch")

      {:error, reason} ->
        Logger.error("Failed to update batch: #{inspect(reason)}")
    end
  end

  defp fetch_tags(e, openai) do
    prompt =
      "Find three tags maximum that resume the radio whose name is given by the chat input. Focus on the type of radio (music, news, talk etc...), DO NOT use music genres (it's stored in a separate field). If not sure about the correct radio, use the country code given in the chat input to select the correct one. You can use its website if it's given in the chat input, Wikipedia and then web search if needed (prioritized in that order). Answer an empty string if you don't find something. Tags must be in English. Return them as one line, each tag in lowercase and separated by a comma, no blank space around the commas."

    params = """
    radio: #{e.name}
    website: #{if not is_nil(e.website), do: e.website, else: "none"}
    country code: #{e.country_code}
    """

    chat_req =
      Chat.Completions.new(
        model: "gpt-4.1-mini",
        messages: [
          ChatMessage.system(prompt),
          ChatMessage.user(params)
        ]
      )

    case Chat.Completions.create(openai, chat_req) do
      {:ok, %{"choices" => [%{"message" => %{"content" => content}} | _]}}
      when is_binary(content) and content != "" and content != "\"\"" ->
        Logger.info(
          "Result found for radio #{e.name} - #{e.id}: #{String.slice(content, 0..100)}"
        )

        content

      _ ->
        Logger.info("No result for radio #{e.name}- #{e.id}")
        nil
    end
  end

  defp process_genres_batch(batch, openai) do
    changesets =
      batch
      |> Enum.map(fn stream_record ->
        {stream_record, fetch_genres(stream_record, openai)}
      end)
      |> Enum.filter(fn {_record, genres} -> genres != nil end)
      |> Enum.map(fn {record, genres} ->
        ProgRadioStream.changeset_genres(record, %{genres: genres})
      end)

    case update_batch(changesets) do
      {:ok, count} ->
        Logger.info("Successfully updated #{count} records in batch")

      {:error, reason} ->
        Logger.error("Failed to update batch: #{inspect(reason)}")
    end
  end

  defp fetch_genres(e, openai) do
    prompt =
      "Find three music genres maximum (but if you find only one or two it's absolutely fine, don't invent to fill the three limit) that are mainly played by the radio whose name is given by the chat input. Only use music genres (rock, jazz, pop etc...), DO NOT use the type of radio (music, news, talk etc...) as it's stored in a separate field. If not sure about the correct radio, use the country code given in the chat input to select the correct one. You can use its website if it's given in the chat input, Wikipedia and then web search if needed (prioritized in that order). Answer an empty string if you don't find something or if the radio does not play music. Genres must be in English. Return them as one line, each genre in lowercase and separated by a comma, no blank space around the commas."

    params = """
    radio: #{e.name}
    website: #{if not is_nil(e.website), do: e.website, else: "none"}
    country code: #{e.country_code}
    """

    chat_req =
      Chat.Completions.new(
        model: "gpt-4.1-mini",
        messages: [
          ChatMessage.system(prompt),
          ChatMessage.user(params)
        ]
      )

    case Chat.Completions.create(openai, chat_req) do
      {:ok, %{"choices" => [%{"message" => %{"content" => content}} | _]}}
      when is_binary(content) and content != "" and content != "\"\"" ->
        Logger.info(
          "Result found for radio #{e.name} - #{e.id}: #{String.slice(content, 0..100)}"
        )

        content

      _ ->
        Logger.info("No result for radio #{e.name}- #{e.id}")
        nil
    end
  end

  defp process_country_code_batch(batch, openai) do
    now = DateTime.utc_now() |> DateTime.truncate(:second)

    multi =
      batch
      |> Enum.map(fn stream_record ->
        {stream_record, fetch_country_code(stream_record, openai)}
      end)
      |> Enum.filter(fn {_record, country_code} -> country_code != nil end)
      |> Enum.reduce(Multi.new(), fn {record, country_code}, multi ->
        multi
        |> Multi.update(
          {:stream, record.id},
          ProgRadioStream.changeset_country_code(record, %{country_code: country_code})
        )
        # the importers take the overloading value over theirs, so it has to be kept in sync
        |> Multi.insert(
          {:overloading, record.id},
          %StreamOverloading{
            id: record.id,
            country_code: country_code,
            enabled: true,
            force_hls: false,
            force_mpd: false,
            force_proxy: false,
            created_at: now,
            updated_at: now
          },
          on_conflict: [set: [country_code: country_code, updated_at: now]],
          conflict_target: :id
        )
      end)

    case Repo.transaction(multi) do
      {:ok, results} ->
        Logger.info("Successfully updated #{div(map_size(results), 2)} records in batch")

      {:error, _name, reason, _changes} ->
        Logger.error("Failed to update batch: #{inspect(reason)}")
    end
  end

  defp fetch_country_code(e, openai) do
    prompt =
      "Find the country of the radio whose name is given by the chat input. Use, in that order of priority: its website if it's given in the chat input (its content, then its domain extension, knowing that generic extensions like .com, .net, .org, .fm, .radio, .online, .io etc. do not indicate a country), its language if given, its name, Wikipedia and then web search if needed. Answer only with the ISO 3166-1 alpha-2 code of the country in uppercase (e.g. FR, US, DE), nothing else. Answer an empty string if you are not sure about the country (and absolutely not that you didn't find information)."

    params = """
    radio: #{e.name}
    website: #{if not is_nil(e.website) and e.website != "", do: e.website, else: "none"}
    domain extension: #{domain_extension(e.website) || "none"}
    language: #{if not is_nil(e.language) and e.language != "", do: e.language, else: "unknown"}
    """

    chat_req =
      Chat.Completions.new(
        model: "gpt-4.1-mini",
        messages: [
          ChatMessage.system(prompt),
          ChatMessage.user(params)
        ]
      )

    case Chat.Completions.create(openai, chat_req) do
      {:ok, %{"choices" => [%{"message" => %{"content" => content}} | _]}}
      when is_binary(content) ->
        country_code = content |> String.trim() |> String.trim("\"") |> String.upcase()

        if Regex.match?(~r/^[A-Z]{2}$/, country_code) do
          Logger.info("Result found for radio #{e.name} - #{e.id}: #{country_code}")
          country_code
        else
          Logger.info("No result for radio #{e.name}- #{e.id}")
          nil
        end

      _ ->
        Logger.info("No result for radio #{e.name}- #{e.id}")
        nil
    end
  end

  defp domain_extension(website) when is_binary(website) and website != "" do
    # URI.parse puts the host in the path when there is no scheme
    website = if String.contains?(website, "://"), do: website, else: "http://" <> website

    case URI.parse(website) do
      %URI{host: host} when is_binary(host) ->
        case host |> String.trim_trailing(".") |> String.split(".") do
          [_, _ | _] = labels -> "." <> String.downcase(List.last(labels))
          _ -> nil
        end

      _ ->
        nil
    end
  end

  defp domain_extension(_website), do: nil

  defp update_batch(changesets) when changesets == [], do: {:ok, 0}

  defp update_batch(changesets) do
    multi =
      changesets
      |> Enum.with_index()
      |> Enum.reduce(Multi.new(), fn {changeset, idx}, multi ->
        Multi.update(multi, {:stream, idx}, changeset)
      end)

    case Repo.transaction(multi) do
      {:ok, results} ->
        {:ok, map_size(results)}

      {:error, _name, changeset, _changes} ->
        {:error, changeset}
    end
  end
end
