defmodule ProgRadioApi.NebulexCacheStore do
  @moduledoc false

  alias ProgRadioApi.Cache

  def get(key) do
    # Nebulex v3 already returns {:ok, value}
    Cache.get(key)
  end

  def put(key, ttl, value) do
    Cache.put(key, value, ttl: ttl)
  end
end
