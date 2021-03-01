defmodule ProgRadioApi.Radios do
  @moduledoc """
  The Radios context.
  """

  import Ecto.Query, warn: false, only: [from: 2]
  alias ProgRadioApi.Repo

  alias ProgRadioApi.Radio
  alias ProgRadioApi.RadioStream
  alias ProgRadioApi.Category
  alias ProgRadioApi.Collection

  @doc """
  Returns the list of radios.

  ## Examples

      iex> list_radios()
      [%Radio{}, ...]

  """
  def list_radios do
    Repo.all(Radio)
  end

  def list_active_radios() do
    query =
      from r in Radio,
        join: c in Category,
        on: r.category_id == c.id,
        left_join: rs in RadioStream,
        on: rs.radio_id == r.id,
        where: r.active == true,
        select: %{
          id: r.id,
          code_name: r.code_name,
          name: r.name,
          share: r.share,
          category: c.code_name
        },
        select_merge: %{
          stream_code_name: rs.code_name,
          stream_name: rs.name,
          stream_url: rs.url,
          stream_main: rs.main,
          stream_current_song: rs.current_song
        }

    Repo.all(query)
    |> Enum.reduce(%{}, fn r, acc ->
      radio =
        case Map.has_key?(acc, r.code_name) do
          true ->
            Map.get(acc, r.code_name)

          false ->
            %{
              id: r.id,
              code_name: r.code_name,
              name: r.name,
              share: r.share,
              category: r.category,
              streaming_enabled: false,
              type: "radio",
              streams: []
            }
        end

      radio =
        case Map.has_key?(r, :stream_code_name) do
          true ->
            stream = %{
              code_name: r.stream_code_name,
              name: r.stream_name,
              url: r.stream_url,
              main: r.stream_main,
              current_song: r.stream_current_song
            }

            %{radio | streams: radio.streams ++ [stream]}

          false ->
            radio
        end

      Map.put(acc, radio.code_name, radio)
    end)
    |> Enum.map(fn {k, r} ->
      case Kernel.length(r.streams) do
        0 -> {k, r}
        _ -> {k, %{r | streaming_enabled: true}}
      end
    end)
    |> Enum.into(%{})
  end

  def list_collections() do
    query =
      from c in Collection,
        join: r in Radio,
        on: r.collection_id == c.id,
        select: %{
          code_name: c.code_name,
          name_FR: c.name,
          short_name: c.short_name,
          priority: c.priority,
          sort_field: c.sort_field,
          sort_order: c.sort_order,
          radios: fragment("array_agg(?)", r.code_name)
        },
        group_by: [c.id, c.priority],
        order_by: [asc: c.priority, asc: c.id]

    Repo.all(query)
    |> Enum.reduce(%{}, fn c, acc ->
      Map.put(acc, c.code_name, c)
    end)
  end

  def list_categories() do
    query =
      from c in Category,
        select: %{
          code_name: c.code_name,
          name_FR: c.name
        },
        order_by: [asc: c.id]

    Repo.all(query)
  end

  #  @doc """
  #  Gets a single radio.
  #
  #  Raises `Ecto.NoResultsError` if the Radio does not exist.
  #
  #  ## Examples
  #
  #      iex> get_radio!(123)
  #      %Radio{}
  #
  #      iex> get_radio!(456)
  #      ** (Ecto.NoResultsError)
  #
  #  """
  #  def get_radio!(id), do: Repo.get!(Radio, id)

  #  @doc """
  #  Creates a radio.
  #
  #  ## Examples
  #
  #      iex> create_radio(%{field: value})
  #      {:ok, %Radio{}}
  #
  #      iex> create_radio(%{field: bad_value})
  #      {:error, %Ecto.Changeset{}}
  #
  #  """
  #  def create_radio(attrs \\ %{}) do
  #    %Radio{}
  #    |> Radio.changeset(attrs)
  #    |> Repo.insert()
  #  end

  #  @doc """
  #  Updates a radio.
  #
  #  ## Examples
  #
  #      iex> update_radio(radio, %{field: new_value})
  #      {:ok, %Radio{}}
  #
  #      iex> update_radio(radio, %{field: bad_value})
  #      {:error, %Ecto.Changeset{}}
  #
  #  """
  #  def update_radio(%Radio{} = radio, attrs) do
  #    radio
  #    |> Radio.changeset(attrs)
  #    |> Repo.update()
  #  end

  #  @doc """
  #  Deletes a radio.
  #
  #  ## Examples
  #
  #      iex> delete_radio(radio)
  #      {:ok, %Radio{}}
  #
  #      iex> delete_radio(radio)
  #      {:error, %Ecto.Changeset{}}
  #
  #  """
  #  def delete_radio(%Radio{} = radio) do
  #    Repo.delete(radio)
  #  end

  #  @doc """
  #  Returns an `%Ecto.Changeset{}` for tracking radio changes.
  #
  #  ## Examples
  #
  #      iex> change_radio(radio)
  #      %Ecto.Changeset{data: %Radio{}}
  #
  #  """
  #  def change_radio(%Radio{} = radio, attrs \\ %{}) do
  #    Radio.changeset(radio, attrs)
  #  end
end
