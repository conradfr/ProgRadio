defmodule ProgRadioApiWeb.StreamController do
  use ProgRadioApiWeb, :controller

  alias ProgRadioApi.Streams
  alias ProgRadioApiWeb.ApiParams.Streams, as: StreamsApiParams

  action_fallback ProgRadioApiWeb.FallbackController

  # ---------- GET ----------

  def index(%{params: conn_params} = conn, _params)
      when :erlang.is_map_key("radio", conn_params) do
    with changeset <- StreamsApiParams.changeset(%StreamsApiParams{}, conn_params),
         {:ok, api_params} <- Ecto.Changeset.apply_action(changeset, :insert) do
      streams =
        api_params
        |> Map.get(:radio)
        |> Streams.get_one()

      render(conn, "index.json", streams: streams)
    else
      _ ->
        conn
        |> put_status(:bad_request)
        |> json(%{"status" => "Error"})
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

      render(conn, "index.json", streams: streams, total: total, timestamp: System.os_time(:microsecond))
    else
      _ ->
        conn
        |> put_status(:bad_request)
        |> json(%{"status" => "Error"})
    end
  end

end
