defmodule ProgRadioApi.Utils.ReqUtils do
  @default_timeout 15_000
  @max_redirects 5

  # tls only options, :gen_tcp exits with :badarg if they are given for a plain http url
  @tls_transport_opts [
    middlebox_comp_mode: false,
    verify: :verify_none
  ]

  # connect_options are merged with the defaults instead of replacing them
  def get_options(opts \\ []) do
    {connect_opts, opts} = Keyword.pop(opts, :connect_options, [])

    default_opts = [
      headers: [{"Cache-Control", "no-cache"}, {"Pragma", "no-cache"}],
      redirect: true,
      max_redirects: @max_redirects,
      connect_options: [
        timeout: @default_timeout,
        transport_opts: @tls_transport_opts
      ]
    ]

    default_opts
    |> Keyword.merge(opts)
    |> Keyword.update!(:connect_options, &Keyword.merge(&1, connect_opts))
  end

  # same as get_options/1 but drops the tls options when the url is plain http
  def get_options_for(url, opts \\ []) do
    options = get_options(opts)

    case URI.parse(url) do
      %URI{scheme: "https"} ->
        options

      _ ->
        update_in(options, [:connect_options, :transport_opts], fn transport_opts ->
          Keyword.drop(transport_opts || [], Keyword.keys(@tls_transport_opts))
        end)
    end
  end
end
