defmodule ProgRadioApi.Utils.ReqUtils do
  @default_timeout 15_000
  @max_redirects 5

  def get_options(opts \\ []) do
    default_opts = [
      headers: [{"Cache-Control", "no-cache"}, {"Pragma", "no-cache"}],
      redirect: true,
      max_redirects: @max_redirects,
      connect_options: [
        timeout: @default_timeout,
        transport_opts: [
          middlebox_comp_mode: false,
          verify: :verify_none
        ]
      ]
    ]

    Keyword.merge(default_opts, opts)
  end
end
