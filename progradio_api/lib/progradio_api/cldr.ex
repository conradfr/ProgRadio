defmodule ProgRadioApi.Cldr do
  use Cldr,
    default_locale: "fr",
    gettext: ProgRadioApiWeb.Gettext,
    locales: ["fr", "en", "es"]
end
