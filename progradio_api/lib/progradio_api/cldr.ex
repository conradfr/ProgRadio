defmodule ProgRadioApi.Cldr do
  use Cldr,
    default_locale: "en",
    gettext: ProgRadioApiWeb.Gettext,
    locales: ["fr", "en", "es", "de", "pt"]
end
