defmodule ProgRadioApiWeb.AdminController do
  import ProgRadioApiWeb.Utils.Controller, only: [send_error: 1]
  use ProgRadioApiWeb, :controller
  import Canada, only: [can?: 2]
  import Ex2ms

  alias ProgRadioApi.Cache

  def empty_cache_stream(conn, _params) do
    with api_key when api_key != nil <- Map.get(conn.private, :api_key),
         true <- can?(api_key, manage(:admin)) do
      # TODO this is the first version / POC, move to own module later
      spec =
        fun do
          {_, {"stream_", key}, value, _, _} -> {{"stream_", key}, value}
        end

      spec_count =
        fun do
          {_, {"stream_count_", key}, value, _, _} -> {{"stream_count_", key}, value}
        end

      Cache.delete_all(spec)
      Cache.delete_all(spec_count)

      render(conn, "clear.json")
    else
      _ -> send_error(conn)
    end
  end

  def import_stream_image(conn, %{"stream_id" => stream_id} = _params)
      when is_binary(stream_id) do
    with api_key when api_key != nil <- Map.get(conn.private, :api_key),
         true <- can?(api_key, manage(:admin)) do
    else
      _ -> send_error(conn)
    end
  end
end
