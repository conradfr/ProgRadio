defmodule ProgRadioApi.SongProvider.Radcap do
  require Logger
  alias ProgRadioApi.SongProvider

  @behaviour ProgRadioApi.SongProvider

  @impl true
  def has_custom_refresh(_name), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(name, last_data) do
    try do
      name
      |> status_url()
      |> SongProvider.get()
    rescue
      _ ->
        :error
    end
  end

  @impl true
  def get_song(name, data, _last_song) do
    try do
      Logger.debug("Data provider - #{name}: parsing data")

      {:ok, html} = Floki.parse_document(data)

      artist_title =
        try do
          html
          |> Floki.find(".streamdata")
          |> Floki.text()
          #          |> :unicode.characters_to_binary(:latin1)
          |> String.trim()
          |> tap(fn e ->
            if e === "", do: nil, else: e
          end)
        rescue
          _ -> nil
        end

      unless artist_title === nil do
        %{
          artist: SongProvider.recase(artist_title),
          title: nil
        }
      else
        %{}
      end
    rescue
      _ ->
        Logger.error("Data provider - #{name}: song error rescue")
        :error
    end
  end

  defp status_url(name) when is_binary(name) do
    url = fetch_url(name)
    parsed = URI.parse(url)
    mount = parsed.path || "/"

    "#{parsed.scheme}://#{parsed.host}:8000/status.xsl?mount=#{mount}&_=#{SongProvider.now_unix(:millisecond)}"
  end

  defp fetch_url(name) when is_binary(name) do
    regex = ~r/(https?:\/\/.+)$/
    [_, url] = Regex.run(regex, name)
    url
  end
end
