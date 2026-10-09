defmodule ProgRadioApi.Importer.Classifiers.TagsClassifier do
  @moduledoc """
  Separates the music genres from the other tags of a stream.
  Removes useless tags
  """

  @genres_path Path.expand("../../../../priv/classifiers/genres.txt", __DIR__)
  @worthless_path Path.expand("../../../../priv/classifiers/worthless.txt", __DIR__)
  @external_resource @genres_path
  @external_resource @worthless_path

  @genres @genres_path
          |> File.stream!()
          |> Stream.map(&String.trim/1)
          |> Stream.reject(&(&1 == ""))
          |> MapSet.new()

  @worthless @worthless_path
             |> File.stream!()
             |> Stream.map(&String.trim/1)
             |> Stream.reject(&(&1 == ""))
             |> MapSet.new()

  @max_length 25

  # Tags that are split in two by some sources ("top,40"), joined back when they
  # follow each other.
  @joined_tags %{
    {"top", "40"} => "top 40",
    {"adult", "contemporary"} => "adult contemporary",
    {"hip", "hop"} => "hip hop"
  }

  @doc """
  Returns `{genres, others}`, each as a comma separated string, or nil when empty.
  """
  def classify(tags) when is_binary(tags) do
    tags
    |> String.split(",")
    |> classify()
  end

  def classify(tags) when is_list(tags) do
    {genres, others} =
      tags
      |> Enum.map(&(&1 |> clean() |> String.downcase()))
      |> Enum.reject(&(&1 == ""))
      |> join()
      |> Enum.uniq()
      |> Enum.split_with(&MapSet.member?(@genres, &1))

    {join_or_nil(genres), others |> filter() |> join_or_nil()}
  end

  def classify(_tags), do: {nil, nil}

  defp join_or_nil([]), do: nil
  defp join_or_nil(tags), do: Enum.join(tags, ",")

  @doc """
  Cleans a tag name: trimmed, without leading "#" ("#80s") and without enclosing
  quotes ("'synthpop'", "\"pop\"").
  """
  def clean(tag) do
    tag = tag |> String.trim() |> String.trim_leading("#") |> String.trim()

    case Regex.run(~r/^(['"])(.*)\1$/s, tag) do
      [_, _quote, unquoted] -> String.trim(unquoted)
      nil -> tag
    end
  end

  @doc """
  Joins back the tags split in two, listed in @joined_tags.
  Expects trimmed, lowercased tags.
  """
  def join([first, second | rest]) do
    case Map.fetch(@joined_tags, {first, second}) do
      {:ok, joined} -> [joined | join(rest)]
      :error -> [first | join([second | rest])]
    end
  end

  def join(tags), do: tags

  @doc """
  Removes the useless tags: the known worthless ones, numbers other than decades,
  frequencies, bitrates, urls, and tags too short or too long to mean anything.
  Expects trimmed, lowercased tags.
  """
  def filter(tags) when is_list(tags), do: Enum.reject(tags, &useless?/1)

  defp useless?(tag) do
    length = String.length(tag)

    length > @max_length or
      length == 1 or
      MapSet.member?(@worthless, tag) or
      (number?(tag) and not decade?(tag)) or
      frequency?(tag) or
      String.contains?(tag, ["kbps", "kbit/s", "http"])
  end

  defp number?(tag), do: Regex.match?(~r/^\d+([.,]\d+)?$/, tag)

  # "60", "1960", "2000"
  defp decade?(tag), do: Regex.match?(~r/^(19|20)?\d0$/, tag)

  # "101 fm", "101.1 fm", "101fm", "1080am", "88.5 mhz", "fm 101", "fm101", "am1557"
  defp frequency?(tag),
    do: Regex.match?(~r/^(\d+([.,]\d+)?\s*(fm|am|mhz|khz)|(fm|am)\s*\d+([.,]\d+)?)$/, tag)
end
