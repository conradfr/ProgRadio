defmodule ProgRadioApiWeb.AdminController do
  import ProgRadioApiWeb.Utils.Controller, only: [send_error: 1]
  use ProgRadioApiWeb, :controller
  import Canada, only: [can?: 2]
  use Nebulex.Adapters.Local.QueryHelper

  alias ProgRadioApi.Repo
  alias ProgRadioApi.{Cache, Search}
  alias ProgRadioApi.Importer.Tools.Images
  alias ProgRadioApi.Stream

  def empty_cache_stream(conn, _params) do
    with api_key when api_key != nil <- Map.get(conn.private, :api_key),
         true <- can?(api_key, manage(:admin)) do
      # TODO this is the first version / POC, move to own module later
      # select defaults to true, which is what delete_all needs to remove the entry
      spec = match_spec(key: {"stream_", _})
      spec_count = match_spec(key: {"stream_count_", _})

      Cache.delete_all!(query: spec)
      Cache.delete_all!(query: spec_count)

      render(conn, "clear.json")
    else
      _ -> send_error(conn)
    end
  end

  def search_index(conn, _params) do
    with api_key when api_key != nil <- Map.get(conn.private, :api_key),
         true <- can?(api_key, manage(:admin)) do
      Search.index_all()
      render(conn, "search_index.json")
    else
      _ -> send_error(conn)
    end
  end

  # ---------- IMG ----------

  def import_stream_image(conn, %{"stream_id" => stream_id} = _params) do
    with api_key when api_key != nil <- Map.get(conn.private, :api_key),
         true <- can?(api_key, manage(:admin)),
         %Stream{} = stream <- Repo.get(Stream, stream_id) do
      stream_data =
        [
          %{
            id: stream.id,
            code_name: stream.id,
            img_url: stream.original_img
          }
        ]
        |> Images.import_images()
        |> List.first()

      if Map.get(stream_data, :img) != nil do
        stream
        |> Stream.changeset_img(stream_data)
        |> Repo.update()
      end

      render(conn, "import_stream_image.json", %{})
    else
      _ -> send_error(conn)
    end
  end
end
