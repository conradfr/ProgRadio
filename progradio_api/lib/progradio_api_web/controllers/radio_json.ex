defmodule ProgRadioApiWeb.RadioJSON do
  def index(%{radios: radios, collections: collections, categories: categories}) do
    %{radios: radios, collections: collections, categories: categories}
  end

  def list(%{radios: radios}) do
    %{radios: radios}
  end
end
