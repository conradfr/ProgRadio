defmodule ProgRadioApiWeb.CountryJSON do
  def list(%{countries: countries}) do
    %{countries: %Jason.OrderedObject{values: countries}}
  end
end
