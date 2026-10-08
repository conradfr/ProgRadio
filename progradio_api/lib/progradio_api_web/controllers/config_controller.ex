defmodule ProgRadioApiWeb.ConfigController do
  use ProgRadioApiWeb, :controller

  alias ProgRadioApi.Cache

  @cache_key_server "config_radio_browser_url"
  @cache_ttl_server :timer.hours(24)

  def index(conn, _params) do
    server =
      case Cache.get(@cache_key_server) do
        nil ->
          server =
            ProgRadioApi.Importer.StreamsImporter.RadioBrowser.get_one_random_server()
            |> Kernel.to_string()
            |> then(fn x -> "https://" <> x end)

          Cache.put(@cache_key_server, server, ttl: @cache_ttl_server)
          server

        server ->
          server
      end

    streams_proxy_url = Application.get_env(:progradio_api, :streams_proxy_url)
    streams_proxy_key = Redix.command!(:redix, ["LINDEX", "stream_proxy_keys", 0])

    conn
    |> render("index.json",
      radio_browser_url: server,
      streams_proxy_url: streams_proxy_url,
      streams_proxy_key: streams_proxy_key
    )
  end
end
