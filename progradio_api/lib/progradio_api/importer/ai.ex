defmodule ProgRadioApi.Importer.Ai do
  require Logger
  import Ecto.Query, only: [from: 2]
  import Ecto.Changeset, only: [change: 2, put_assoc: 3]
  alias Ecto.Multi
  alias ProgRadioApi.Repo
  alias ProgRadioApi.Stream, as: ProgRadioStream
  alias OpenaiEx.Chat
  alias OpenaiEx.ChatMessage
  alias OpenaiEx.MsgContent

  @default_batch_size 200

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
          s.enabled == true and s.banned == false and is_nil(s.redirect_to) and
            not is_nil(s.country_code) and is_nil(s.description),
        order_by: [desc: s.score, desc: s.clicks_last_24h],
        offset: ^offset,
        limit: ^limit

    Repo.transaction(
      fn ->
        query
        |> Repo.stream(max_rows: 100)
        |> Stream.chunk_every(batch_size)
        |> Stream.each(fn batch ->
          process_batch(batch, openai)
        end)
        |> Stream.run()
      end,
      timeout: :infinity
    )
  end

  defp process_batch(batch, openai) do
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
      "Describe in three sentences maximum the radio whose name is given by the chat input. If not sure about the correct radio, use the country code given in the chat input to select the correct one. You can use its website if it's given in the chat input, Wikipedia and then web search if needed (prioritized in that order). Answer nothing if you don't find something. Your answer must be in the most appropriate language for the country code given in the chat input, taking also into account the language given in the input chat (if any), Translate it if you need."

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
      when is_binary(content) and content != "" ->
        Logger.info(
          "Result found for radio #{e.name} - #{e.id}: #{String.slice(content, 0..10)} (...)"
        )

        content

      _ ->
        Logger.info("No result for radio #{e.name}- #{e.id}")
        nil
    end
  end

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
