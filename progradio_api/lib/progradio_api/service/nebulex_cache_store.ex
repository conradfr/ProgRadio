defmodule ProgRadioApi.NebulexCacheStore do
  @moduledoc false

  alias ProgRadioApi.Cache

  def get(key) do
    {:ok, Cache.get(key)}
  end

  def put(key, ttl, value) do
    Cache.put(key, value, ttl: ttl)
  end
end
