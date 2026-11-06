defmodule ProgRadioApi.Utils.ChatUtils do
  @moduledoc """
  Chat names and messages validation, filtering and rate limiting.
  """

  @link_markers ["http", "www", "://"]

  @name_max_length 30
  @default_name "Anonymous"
  # same as the input maxlength in the chat modal
  @msg_max_length 500

  # rate limit: max messages per sliding window, per channel join
  @rate_limit_max_msgs 5
  @rate_limit_window_ms 10_000

  # trimmed and truncated name, default one when missing/empty
  @spec sanitize_name(any()) :: String.t()
  def sanitize_name(name) when is_binary(name) do
    case name |> String.trim() |> String.slice(0, @name_max_length) do
      "" -> @default_name
      name -> name
    end
  end

  def sanitize_name(_name), do: @default_name

  # msg must already be trimmed.
  # byte_size first: cheap, and avoids counting graphemes of a huge payload
  # (a grapheme is at most a few bytes for any real text)
  @spec valid_msg?(String.t()) :: boolean()
  def valid_msg?(""), do: false

  def valid_msg?(msg) when is_binary(msg) do
    byte_size(msg) <= @msg_max_length * 4 and String.length(msg) <= @msg_max_length
  end

  # Sliding window: at most @rate_limit_max_msgs accepted messages in the last @rate_limit_window_ms.
  # msg_times are the monotonic ms timestamps of the last accepted messages, kept by the caller
  # (the channel socket assigns). Returns the updated list: with `now` added when accepted,
  # only pruned when refused (only accepted messages are counted).
  @spec check_rate_limit([integer()], integer()) :: {:ok, [integer()]} | {:error, [integer()]}
  def check_rate_limit(msg_times, now \\ System.monotonic_time(:millisecond)) do
    # monotonic: not affected by system clock changes
    recent = Enum.filter(msg_times, &(now - &1 < @rate_limit_window_ms))

    if length(recent) >= @rate_limit_max_msgs do
      {:error, recent}
    else
      {:ok, [now | recent]}
    end
  end

  # true when the name or the message contains a link, the message must then not be broadcast
  @spec filtered?(String.t(), String.t()) :: boolean()
  def filtered?(name, msg), do: contains_link?(name) or contains_link?(msg)

  @spec contains_link?(String.t()) :: boolean()
  def contains_link?(text) do
    normalized = normalize_for_filter(text)

    # all whitespace removed, against "h t t p", "w w w", "s i t e . c o m"
    stripped = String.replace(normalized, ~r/\s+/u, "")

    # whitespace removed around a dot only when there's some before it, against "site . com" / "site .com"
    # (a sentence end "fini. Info du jour" has none, and must not become "fini.info")
    dots_joined = String.replace(normalized, ~r/\s+\.\s*/u, ".")

    # any domain followed by a path: "site.shop/promo"
    String.contains?(stripped, @link_markers) or
      domain?(stripped) or
      domain?(dots_joined) or
      Regex.match?(~r|[\p{L}\p{N}-]\.\p{L}{2,24}/|u, stripped)
  end

  # the extension must not be followed by a letter/digit, or "fini. Comment ça va"
  # ("fini.commentçava" once stripped) would match ".com".
  # Extensions that are also common words are left out (de, eu, ca, me, be, to, gg, top...)
  @spec domain?(String.t()) :: boolean()
  defp domain?(text) do
    Regex.match?(
      ~r/[\p{L}\p{N}-]\.(?:com|net|org|fr|info|xyz|io|tv|fm|uk|ru|ch)(?![\p{L}\p{N}])/u,
      text
    )
  end

  @spec normalize_for_filter(String.t()) :: String.t()
  defp normalize_for_filter(text) do
    text
    # compatibility forms to plain ones: fullwidth "ｗｗｗ", math bold "𝐡𝐭𝐭𝐩", "．"...
    |> nfkc()
    |> String.downcase()
    # invisible chars (zero width space/joiner, soft hyphen...) used to split words
    |> String.replace(~r/\p{Cf}/u, "")
    # dot lookalikes not handled by nfkc
    |> String.replace(~r/[。・·•]/u, ".")
    # "site(.)com", "site [dot] com", "site (point) com"
    |> String.replace(~r/[\(\[\{]\s*(?:\.|dot|point)\s*[\)\]\}]/u, ".")
  end

  defp nfkc(text) do
    case :unicode.characters_to_nfkc_binary(text) do
      normalized when is_binary(normalized) -> normalized
      _ -> text
    end
  end
end
