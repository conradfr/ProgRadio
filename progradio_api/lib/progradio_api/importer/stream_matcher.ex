defmodule ProgRadioApi.Importer.StreamsImporter.StreamMatcher do
  import Ecto.Query, only: [from: 2]
  import Ecto.Changeset, only: [change: 2, put_assoc: 3]
  alias Ecto.Multi
  alias ProgRadioApi.Repo
  alias ProgRadioApi.Stream
  alias ProgRadioApi.RadioStream

  @countries ["FR", "BE", "CH"]

  def match() do
    get_streams_without_match()
    |> find_match()
    |> store()
  end

  def get_streams_without_match() do
    query =
      from s in Stream,
        left_join: rs in assoc(s, :radio_stream),
        left_join: r in assoc(rs, :radio),
        where: s.country_code in ^@countries and is_nil(rs.id)

    Repo.all(query)
    |> Repo.preload(:radio_stream)
  end

  defp find_match(streams) do
    streams
    |> Enum.reduce([], fn s, acc ->
      # that will not use an index but as the dataset is small and this query execute rarely is should be fine
      query =
        from rs in RadioStream,
          join: r in assoc(rs, :radio),
          where:
            fragment(
              "LOWER(?) = ? AND ? = ?",
              rs.name,
              ^String.downcase(s.name),
              r.country_code,
              ^s.country_code
            ),
          limit: 1,
          order_by: [desc: rs.id]

      radio_stream = Repo.one(query)

      case radio_stream do
        nil ->
          acc

        _ ->
          changeset =
            s
            |> change(%{})
            |> put_assoc(:radio_stream, radio_stream)

          [changeset | acc]
      end
    end)
  end

  defp store(changesets) do
    changesets
    |> Enum.with_index()
    |> Enum.reduce(Multi.new(), fn {c, index}, multi ->
      Multi.update(multi, index, c)
    end)
    |> Repo.transaction()
  end
end
