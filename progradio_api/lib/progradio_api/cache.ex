defmodule ProgRadioApi.Cache do
  use Nebulex.Cache,
    otp_app: :progradio_api,
    adapter: Nebulex.Adapters.Local
end
