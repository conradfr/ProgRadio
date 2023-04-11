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
end
