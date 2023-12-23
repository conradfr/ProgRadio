defmodule ProgRadioApi.Importer.StreamsImporter.Transformers.Streams do

   # generated by ChatGPT4 because lazy)
  def streamtheworld({:continue, stream_url}) do
    # Matches URLs from streamtheworld with any number after the colon
    pattern = ~r/(https?:\/\/\d+\.live\.streamtheworld\.com(:\d+)?\/)(\w+)/

    case Regex.match?(pattern, stream_url) and
         !String.contains?(stream_url, ".m3u8") do
      true ->
        replacement_fn = fn _, _, _, last_part ->
          "https://playerservices.streamtheworld.com/api/livestream-redirect/#{last_part}"
        end

        {:ok, Regex.replace(pattern, stream_url, replacement_fn)}

      false ->
        {:continue, stream_url}
    end
  end

  def streamtheworld(stream_url), do: stream_url

  def infomaniak({:continue, stream_url}) do
    pattern = ~r/http:(.+)\.infomaniak\.(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  def infomaniak(stream_url), do: stream_url

  def ssr({:continue, stream_url}) do
    pattern = ~r/http:(.+)\.srg-ssr\.(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  def ssr(stream_url), do: stream_url

  def zeno({:continue, stream_url}) do
    pattern = ~r/http:\/\/stream\-(.+)\.zeno\.(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  def zeno(stream_url), do: stream_url

  def laut({:continue, stream_url}) do
    pattern = ~r/http:\/\/(.+)\.stream\.laut\.fm(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  def laut(stream_url), do: stream_url

  def network181({:continue, stream_url}) do
    pattern = ~r/http:\/\/(.+)\.181fm\.com(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  def network181(stream_url), do: stream_url

  def exclusive({:continue, stream_url}) do
    pattern = ~r/http:\/\/(.+)\.exclusive\.radio(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  def exclusive(stream_url), do: stream_url

  def harmony({:continue, stream_url}) do
    pattern = ~r/http:\/\/(.+)\.harmonyfm(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  def harmony(stream_url), do: stream_url

  def streamabc({:continue, stream_url}) do
    pattern = ~r/http:\/\/(.+)\.streamabc(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  def streamabc(stream_url), do: stream_url

  def radioparadise({:continue, stream_url}) do
    pattern = ~r/http:\/\/(.+)\.stream\.radioparadise\.com(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  def radioparadise(stream_url), do: stream_url

  def creacast({:continue, stream_url}) do
    pattern = ~r/http:\/\/(.+)creacast\.com(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  def creacast(stream_url), do: stream_url

  def network1fm({:continue, stream_url}) do
    pattern = ~r/http:\/\/(.+)\.1\.fm\/(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  def network1fm(stream_url), do: stream_url

  def radiojar({:continue, stream_url}) do
    pattern = ~r/http:\/\/(.+)\.radiojar\.com\/(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  def radiojar(stream_url), do: stream_url

  def prohifi({:continue, stream_url}) do
    pattern = ~r/http:\/\/(.+)\.pro-fhi\.net\/(.+)/

    case Regex.match?(pattern, stream_url) do
      true ->
        {:ok, String.replace_leading(stream_url, "http://", "https://")}

      false ->
        {:continue, stream_url}
    end
  end

  def prohifi(stream_url), do: stream_url

end