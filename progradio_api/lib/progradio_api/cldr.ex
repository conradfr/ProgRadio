defmodule ProgRadioApi.Cldr do
  use Cldr,
    default_locale: "en",
    gettext: ProgRadioApiWeb.Gettext,
    locales: ["fr", "en", "es", "de", "pt", "it", "el", "ar","ro","hu","pl"]
end
