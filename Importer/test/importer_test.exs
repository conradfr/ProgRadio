defmodule ImporterTest do
  use ExUnit.Case
  doctest Importer

  test "greets the world" do
    assert Importer.hello() == :world
  end
end
