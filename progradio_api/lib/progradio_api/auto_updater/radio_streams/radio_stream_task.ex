defmodule ProgRadioApi.AutoUpdater.RadioStreams.RadioStreamTask do
  require Logger
  alias ProgRadioApi.Repo
  alias ProgRadioApi.{RadioStream, RadioStreamUpdate}

  def start_link(radio_stream) do
    Logger.info("Checking and updating: #{radio_stream.code_name}")

    case get_updated_url(radio_stream) do
      {:ok, new_url} when is_binary(new_url) and new_url != radio_stream.url ->
        Logger.debug("Auto-update stream: updating - #{radio_stream.code_name} - #{new_url} ")
        update_in_db(radio_stream, new_url)

      {:ok, new_url} when is_binary(new_url) ->
        Logger.debug("Auto-update stream: url has not changed- #{radio_stream.code_name}",
          code_name: radio_stream.code_name
        )

        update_in_db(radio_stream, new_url)

      {_, nil} ->
        Logger.debug("Auto-update stream: nothing returned- #{radio_stream.code_name}",
          code_name: radio_stream.code_name
        )

        update_in_db(radio_stream, nil)
    end
  end

  defp get_updated_url(%RadioStream{} = radio_stream)
       when radio_stream.radio_stream_update.type == "json" do
    try do
      path = String.split(radio_stream.radio_stream_update.path, ".")

      url =
        Req.get!(radio_stream.radio_stream_update.url)
        |> Map.get(:body)
        |> Kernel.get_in(path)

      {:ok, url}
    rescue
      e ->
        Logger.warning("Auto-update stream: #{radio_stream.code_name} - error", error: e)
        Logger.debug(e)
        {:error, nil}
    end
  end

  defp update_in_db(%RadioStream{} = radio_stream, new_stream_url)
       when is_binary(new_stream_url) do
    if radio_stream.url != new_stream_url do
      radio_stream
      |> RadioStream.update_url(%{url: new_stream_url})
      |> Repo.update()
    end

    radio_stream.radio_stream_update
    |> RadioStreamUpdate.update_run(%{last_successful_run: NaiveDateTime.utc_now()})
    |> Repo.update()
  end

  defp update_in_db(%RadioStream{} = radio_stream, nil) do
    radio_stream.radio_stream_update
    |> RadioStreamUpdate.update_run(%{last_failed_run: NaiveDateTime.utc_now()})
    |> Repo.update()
  end
end
