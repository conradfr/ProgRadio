defmodule ProgRadioApi.Utils.ImporterUtilsTest do
  use ExUnit.Case, async: true

  # Adjust the module name to match your actual module
  alias ProgRadioApi.Utils.ImporterUtils

  describe "replace_value_maybe/4" do
    # --- Higher priority caller replaces existing value ---

    test "progradio caller replaces radio-browser value" do
      existing = %{source: "radio-browser", name: "old_name"}

      assert ImporterUtils.replace_value_maybe("new_name", "progradio", existing, :name) ==
               "new_name"
    end

    test "progradio caller replaces lautfm value" do
      existing = %{source: "lautfm", name: "old_name"}

      assert ImporterUtils.replace_value_maybe("new_name", "progradio", existing, :name) ==
               "new_name"
    end

    test "lautfm caller replaces api50k value" do
      existing = %{source: "api50k", name: "old_name"}

      assert ImporterUtils.replace_value_maybe("new_name", "lautfm", existing, :name) ==
               "new_name"
    end

    test "api50k caller replaces radio-browser value" do
      existing = %{source: "radio-browser", name: "old_name"}

      assert ImporterUtils.replace_value_maybe("new_name", "api50k", existing, :name) ==
               "new_name"
    end

    test "radio-browser caller replaces nil source value" do
      existing = %{source: nil, name: "old_name"}

      assert ImporterUtils.replace_value_maybe("new_name", "radio-browser", existing, :name) ==
               "new_name"
    end

    # --- Lower priority caller does NOT replace existing value ---

    test "radio-browser caller does not replace progradio value" do
      existing = %{source: "progradio", name: "old_name"}

      assert ImporterUtils.replace_value_maybe("new_name", "radio-browser", existing, :name) ==
               "old_name"
    end

    test "api50k caller does not replace lautfm value" do
      existing = %{source: "lautfm", name: "old_name"}

      assert ImporterUtils.replace_value_maybe("new_name", "api50k", existing, :name) ==
               "old_name"
    end

    test "nil caller does not replace radio-browser value" do
      existing = %{source: "radio-browser", name: "old_name"}
      assert ImporterUtils.replace_value_maybe("new_name", nil, existing, :name) == "old_name"
    end

    test "weloveradio caller does not replace progradio value" do
      existing = %{source: "progradio", name: "old_name"}

      assert ImporterUtils.replace_value_maybe("new_name", "weloveradio", existing, :name) ==
               "old_name"
    end

    # --- Equal priority keeps new value ---

    test "same source caller uses new value" do
      existing = %{source: "lautfm", name: "old_name"}

      assert ImporterUtils.replace_value_maybe("new_name", "lautfm", existing, :name) ==
               "new_name"
    end

    test "progradio replacing progradio uses new value" do
      existing = %{source: "progradio", name: "old_name"}

      assert ImporterUtils.replace_value_maybe("new_name", "progradio", existing, :name) ==
               "new_name"
    end

    # --- Nil value fallback behavior ---

    test "higher priority caller with nil value falls back to existing" do
      existing = %{source: "radio-browser", name: "old_name"}
      assert ImporterUtils.replace_value_maybe(nil, "progradio", existing, :name) == "old_name"
    end

    test "lower priority caller with nil value still returns existing" do
      existing = %{source: "progradio", name: "old_name"}

      assert ImporterUtils.replace_value_maybe(nil, "radio-browser", existing, :name) ==
               "old_name"
    end

    # --- Nil existing field fallback behavior ---

    test "lower priority caller falls back to value when existing field is nil" do
      existing = %{source: "progradio", name: nil}

      assert ImporterUtils.replace_value_maybe("new_name", "radio-browser", existing, :name) ==
               "new_name"
    end

    test "higher priority caller with value when existing field is nil" do
      existing = %{source: "radio-browser", name: nil}

      assert ImporterUtils.replace_value_maybe("new_name", "progradio", existing, :name) ==
               "new_name"
    end

    # --- Both nil ---

    test "returns nil when both value and existing field are nil" do
      existing = %{source: "radio-browser", name: nil}
      assert ImporterUtils.replace_value_maybe(nil, "progradio", existing, :name) == nil
    end

    # --- Unknown source defaults to lowest priority ---

    test "unknown existing source is treated as lowest priority" do
      existing = %{source: "unknown_source", name: "old_name"}

      assert ImporterUtils.replace_value_maybe("new_name", "radio-browser", existing, :name) ==
               "new_name"
    end

    test "unknown caller source is treated as lowest priority" do
      existing = %{source: "radio-browser", name: "old_name"}

      assert ImporterUtils.replace_value_maybe("new_name", "unknown_source", existing, :name) ==
               "old_name"
    end

    # --- Different existing keys ---

    test "works with different map keys" do
      existing = %{source: "radio-browser", url: "http://old.com"}

      assert ImporterUtils.replace_value_maybe("http://new.com", "progradio", existing, :url) ==
               "http://new.com"
    end
  end
end
