defmodule ProgRadioApiWeb.CountryController do
  use ProgRadioApiWeb, :controller

  alias ProgRadioApi.Cldr
  alias ProgRadioApi.Streams

  # one day
  @cache_ttl :timer.seconds(86400)

  def list(conn, params) do
    %{language: default_locale} = Cldr.default_locale()

    countries =
      params
      |> Map.get("locale", default_locale)
      |> Streams.get_countries()

    conn
    |> RequestCache.store(@cache_ttl)
    |> render("list.json", countries: countries)
  end
end
