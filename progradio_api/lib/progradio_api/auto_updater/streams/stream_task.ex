defmodule ProgRadioApi.AutoUpdater.Streams.StreamTask do
  require Logger
  import Ecto.Query, only: [from: 2]
  alias ProgRadioApi.Repo
  alias ProgRadioApi.{Stream, StreamAutoUpdate, StreamOverloading}

  def start_link(%Stream{} = stream) do
    Task.start_link(fn ->
      Logger.info("Checking and updating: #{stream.id}")

      case get_updated_url(stream) do
        {:ok, new_url} when is_binary(new_url) and new_url != stream.stream_url ->
          Logger.debug("Auto-update stream: updating - #{stream.id} - #{new_url} ")
          update_in_db(stream, new_url)

        {:ok, new_url} when is_binary(new_url) ->
          Logger.debug("Auto-update stream: url has not changed- #{stream.id}",
            id: stream.id
          )

          update_in_db(stream, new_url)

        {_, nil} ->
          Logger.debug("Auto-update stream: nothing returned - #{stream.id}",
            id: stream.id
          )

          update_in_db(stream, nil)
      end
    end)
  end

  defp get_updated_url(%Stream{website: website} = stream)
       when is_nil(stream.stream_auto_update) and is_binary(website) do
    cond do
      String.contains?(website, ".radio12345.com") -> get_radio12345_url(stream, website)
      String.contains?(website, "zeno.fm/radio/") -> get_zeno_url(stream, website)
      true -> {:error, nil}
    end
  end

  defp get_updated_url(%Stream{} = stream) when is_nil(stream.stream_auto_update),
    do: {:error, nil}

  defp get_updated_url(%Stream{} = stream)
       when stream.stream_auto_update.type == "radio12345" do
    get_radio12345_url(stream, stream.stream_auto_update.url)
  end

  defp get_updated_url(%Stream{} = stream)
       when stream.stream_auto_update.type == "json" do
    try do
      path = String.split(stream.stream_auto_update.path, ".")

      url =
        stream.stream_auto_update.url
        |> Req.get!()
        |> Map.get(:body)
        |> Kernel.get_in(path)

      {:ok, url}
    rescue
      e ->
        Logger.warning("Auto-update stream (json): #{stream.id} - error", error: e)
        Logger.debug(e)
        {:error, nil}
    end
  end

  defp get_updated_url(%Stream{} = stream)
       when stream.stream_auto_update.type == "mixlr_json" do
    try do
      url =
        stream.stream_auto_update.url
        |> Req.get!()
        |> Map.get(:body)
        |> Map.get("included", [])
        |> List.first(%{})
        |> Map.get("attributes", %{})
        |> Map.get("progressive_stream_url")

      case url do
        nil ->
          Logger.warning("Auto-update stream (mixlr_json): #{stream.id} - error (no api data)")
          {:error, nil}

        _ ->
          {:ok, url}
      end
    rescue
      e ->
        Logger.warning("Auto-update stream (mixlr_json): #{stream.id} - error", error: e)
        {:error, nil}
    end
  end

  defp get_radio12345_url(%Stream{} = stream, url) do
    try do
      url =
        url
        |> Req.get!()
        |> Map.get(:body)
        |> Floki.parse_document!()
        |> Floki.get_by_id("urladdress")
        |> Floki.text()
        |> String.trim()

      case url do
        nil -> {:error, nil}
        "" -> {:error, nil}
        _ -> {:ok, url}
      end
    rescue
      e ->
        Logger.warning("Auto-update stream (website): #{stream.id} - error", error: e)
        Logger.debug(e)
        {:error, nil}
    end
  end

  # the stream url is in the nuxt payload, with escaped slashes: https://stream.zeno.fm/xxxx
  defp get_zeno_url(%Stream{} = stream, url) do
    try do
      body =
        url
        |> Req.get!()
        |> Map.get(:body)

      case Regex.run(~r/https:\\u002F\\u002Fstream\.zeno\.fm\\u002F([a-z0-9]+)/i, body) do
        [_, mount] -> {:ok, "https://stream.zeno.fm/" <> mount}
        _ -> {:error, nil}
      end
    rescue
      e ->
        Logger.warning("Auto-update stream (zeno): #{stream.id} - error", error: e)
        Logger.debug(e)
        {:error, nil}
    end
  end

  defp update_in_db(%Stream{stream_auto_update: stream_auto_update} = _stream, nil)
       when not is_nil(stream_auto_update) do
    stream_auto_update
    |> StreamAutoUpdate.update_run(%{last_failed_run: NaiveDateTime.utc_now()})
    |> Repo.update()
  end

  defp update_in_db(%Stream{} = _stream, nil), do: {:ok, nil}

  defp update_in_db(%Stream{} = stream, new_stream_url)
       when is_binary(new_stream_url) do
    if stream.stream_url != new_stream_url do
      stream
      |> Stream.changeset_url(%{stream_url: new_stream_url})
      |> Repo.update()
    end

    # keep the overloading in sync (if there is one), otherwise the importers would restore the old url
    from(so in StreamOverloading,
      where: so.id == ^stream.id,
      where: is_nil(so.stream_url) or so.stream_url != ^new_stream_url
    )
    |> Repo.update_all(set: [stream_url: new_stream_url])

    if stream.stream_auto_update != nil do
      stream.stream_auto_update
      |> StreamAutoUpdate.update_run(%{last_successful_run: NaiveDateTime.utc_now()})
      |> Repo.update()
    end
  end
end
