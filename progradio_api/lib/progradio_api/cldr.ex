defmodule ProgRadioApi.Cldr do
  use Cldr,
    default_locale: "fr",
    locales: ["fr", "en", "es"]
end
