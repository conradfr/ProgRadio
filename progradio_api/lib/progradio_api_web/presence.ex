defmodule ProgRadioApiWeb.Presence do
  use Phoenix.Presence,
    otp_app: :progradio_api,
    pubsub_server: ProgRadioApi.PubSub
end
