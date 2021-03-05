defmodule ProgRadioApi.Utils do
  require Logger

  @spec set_ttl_if_none(String.t(), integer()) :: tuple()
  def set_ttl_if_none(key, ttl) do
    case Cachex.ttl(:progradio_cache, key) do
      {:ok, nil} -> Cachex.expire(:progradio_cache, key, ttl)
      _ -> {:ok, true}
    end
  end

  def clear_cache() do
    Cachex.clear(:progradio_cache)
  end
end
