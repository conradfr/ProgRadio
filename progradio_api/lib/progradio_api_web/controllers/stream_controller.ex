defmodule ProgRadioApiWeb.StreamController do
  import ProgRadioApiWeb.Utils.Controller, only: [send_error: 1]
  use ProgRadioApiWeb, :controller

  alias ProgRadioApi.Streams
  alias ProgRadioApiWeb.ApiParams.Streams, as: StreamsApiParams

  # ---------- GET ----------

  def index(%{params: conn_params} = conn, _params)
      when is_map_key(conn_params, "radio") do
    with changeset <- StreamsApiParams.changeset(%StreamsApiParams{}, conn_params),
         {:ok, api_params} <- Ecto.Changeset.apply_action(changeset, :insert) do
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
    with changeset <- StreamsApiParams.changeset(%StreamsApiParams{}, conn_params),
         {:ok, api_params} <- Ecto.Changeset.apply_action(changeset, :insert) do
      total = Streams.count(api_params)

      streams =
        unless total == 0 do
          Streams.get(api_params)
        else
          []
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
