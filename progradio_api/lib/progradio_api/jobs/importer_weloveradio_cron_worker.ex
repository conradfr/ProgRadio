defmodule ProgRadioApi.ImporterWeLoveRadioCronWorker do
  use Oban.Worker, queue: :cron
  import Ecto.Query, warn: false, only: [from: 2]
  require Logger

  alias ProgRadioApi.ImporterWeLoveRadioImportWorker

  @impl Oban.Worker
  def perform(%Oban.Job{args: _args}) do
    Logger.debug("WeLoveRadio importer cron worker")

    try do
      Req.post!(
        "https://welove.radio",
        body: "[]",
        headers: [
          {"Cache-Control", "no-cache"},
          {"Pragma", "no-cache"},
          {"Content-Type", "text/plain;charset=UTF-8"},
          {"Accept", "text/x-component"},
          {"Referer", "https://welove.radio/"},
          {"Host", "welove.radio"},
          {"Origin", "https://welove.radio"},
          {"Alt-Used", "welove.radio"},
          {"Priority", "u=0"},
          {"TE", "trailers"},
          {"Sec-GPC", "1"},
          {"Sec-Fetch-Dest", "empty"},
          {"Sec-Fetch-Mode", "cors"},
          {"Sec-Fetch-Site", "same-origin"},
          {"User-Agent",
           "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:149.0) Gecko/20100101 Firefox/149.0"},
          {"Accept-Language", "en-US;q=0.9,en;q=0.8,fr,fr-FR;q=0.7"},
          {"Next-Action", "349d6a9df0619364852190fc39bae2d739a3b9ea"}
        ],
        redirect: false,
        connect_options: [timeout: 15_000]
      )
      |> Map.get(:body)
      |> String.split("\n")
      |> Enum.find(&String.starts_with?(&1, "1:"))
      |> String.replace_prefix("1:", "")
      |> JSON.decode!()
      |> ImporterWeLoveRadioImportWorker.new()
      |> Oban.insert()
    rescue
      _ ->
        Logger.debug("WeLoveRadio importer cron worker - rescue")
    end

    :ok
  end
end
