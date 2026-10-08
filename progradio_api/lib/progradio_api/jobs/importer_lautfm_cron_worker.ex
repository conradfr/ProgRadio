defmodule ProgRadioApi.ImporterLautfmCronWorker do
  use Oban.Worker, queue: :cron
  require Logger

  alias ProgRadioApi.ImporterLautfmImportWorker

  @base_url "https://api.laut.fm"
  @page_size 250

  @impl Oban.Worker
  def perform(%Oban.Job{args: _args}) do
    Logger.info("Lautfm importer cron worker")

    get_radios()
    |> Enum.each(fn stream ->
      stream
      |> ImporterLautfmImportWorker.new()
      |> Oban.insert()
    end)

    :ok
  end

  # Data

  defp get_radios() do
    try do
      fetch_all_pages(0, [])
      |> Enum.uniq_by(fn s -> Map.get(s, "name") end)
    rescue
      _ ->
        Logger.warning("Lautfm import: error importing radios")
        []
    catch
      _ ->
        Logger.warning("Lautfm import: error importing radios")
        []
    end
  end

  defp fetch_all_pages(offset, acc) do
    url = "#{@base_url}/stations?order=asc&limit=#{@page_size}&offset=#{offset}"

    Logger.info("Lautfm import: fetching offset=#{offset}, limit=#{@page_size}")

    results =
      Req.get!(
        url,
        headers: [{"User-Agent", "radio-addict.com"}]
      )
      |> Map.get(:body)
      |> Map.get("items", [])

    new_acc = acc ++ results

    if length(results) >= @page_size do
      fetch_all_pages(offset + @page_size, new_acc)
    else
      new_acc
    end
  end
end
