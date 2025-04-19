defmodule ProgRadioApiWeb.StreamController do
  import ProgRadioApiWeb.Utils.Controller, only: [send_error: 1]
  use ProgRadioApiWeb, :controller
  use Goal

  alias ProgRadioApi.Streams

  # ---------- GET ----------

  defparams :get do
    optional(:radio, :string, format: :uuid)
    optional(:text, :string)
    optional(:country, :string, rules: [trim: true, min: 2, max: 2])
    #    optional :sort, :enum, values: ["name", "popularity", "last", "random"]
    optional(:sort, :string)
    optional(:offset, :integer)
    optional(:limit, :integer)
  end

  def index(%{params: conn_params} = conn, _params)
      when is_map_key(conn_params, "radio") do
    with {:ok, api_params} <- validate(:get, conn_params) do
      streams =
        api_params
        |> Map.get(:radio)
        |> Streams.get_one()

      render(conn, "index.json", streams: [streams])
    else
      _ -> send_error(conn)
    end
  end

  def index(%{params: conn_params} = conn, _params) do
    with {:ok, api_params} <- validate(:get, conn_params) do
      [streams, total] =
        case Streams.get(api_params) do
          [results, count] -> [results, count]
          results -> [results, Streams.count(api_params)]
        end

      render(conn, "index.json",
        streams: streams,
        total: total,
        timestamp: System.os_time(:microsecond)
      )
    else
      _ -> send_error(conn)
    end
  end

  # ---------- POST ----------

  def playing_error(conn, %{"id" => id} = params) when is_binary(id) do
    Streams.register_streaming_error(id, Map.get(params, "error"))

    render(conn, "playing_error.json", %{})
  end

  def search_term(conn, %{"term" => term} = _params) when is_binary(term) do
    Streams.add_search_term(term)
    render(conn, "search.json", %{})
  end
end
