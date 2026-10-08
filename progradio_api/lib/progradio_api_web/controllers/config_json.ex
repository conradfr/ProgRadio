defmodule ProgRadioApiWeb.ConfigJSON do
  def index(%{} = args) do
    %{
      radio_browser_url: args.radio_browser_url,
      streams_proxy_url: args.streams_proxy_url,
      streams_proxy_key: args.streams_proxy_key
    }
  end
end
