defmodule ProgRadioApi.Utils.ReqUtils do
  @default_timeout 15_000
  @max_redirects 5

  # tls only options, :gen_tcp exits with :badarg if they are given for a plain http url
  @tls_transport_opts [
    middlebox_comp_mode: false,
    verify: :verify_none
  ]

  # ----- Pools started once with the application -----

  # when connect_options are given Req starts (or tries to start) a Finch pool at each request,
  # which is costly for the requests done all the time (live songs): these ones use pools started with the application
  # the connect timeout and the tls options are part of the pool, they can't be set per request anymore
  @pools %{
    # tls options are only valid for https, hence the two pools
    song_https: [name: ProgRadioApi.Finch.SongHttps, timeout: 5_000, tls_opts: true],
    song_http: [name: ProgRadioApi.Finch.SongHttp, timeout: 5_000, tls_opts: false],
    # default tls verification
    hls: [name: ProgRadioApi.Finch.Hls, timeout: 7_500, tls_opts: false],
    # metadata read from the streams themselves (icecast library): thousands of hosts and no connection reuse
    # as the stream is never read entirely, so the pool of a host is stopped when it is not used anymore
    icecast_https: [
      name: ProgRadioApi.Finch.IcecastHttps,
      timeout: 5_000,
      tls_opts: true,
      max_idle_time: 60_000
    ],
    icecast_http: [
      name: ProgRadioApi.Finch.IcecastHttp,
      timeout: 5_000,
      tls_opts: false,
      max_idle_time: 60_000
    ]
  }

  # same pool options as the ones Req builds from connect_options
  def pool_child_specs() do
    for {_key, pool} <- @pools do
      transport_opts =
        [timeout: pool[:timeout]] ++ if(pool[:tls_opts], do: @tls_transport_opts, else: [])

      pool_opts =
        [protocols: [:http1], conn_opts: [transport_opts: transport_opts]] ++
          if(pool[:max_idle_time], do: [pool_max_idle_time: pool[:max_idle_time]], else: [])

      Supervisor.child_spec({Finch, name: pool[:name], pools: %{default: pool_opts}},
        id: pool[:name]
      )
    end
  end

  # same as get_options_for/2 but with a pre-started pool instead of connect_options
  def get_song_options_for(url, opts \\ []) do
    pool =
      case URI.parse(url) do
        %URI{scheme: "https"} -> @pools.song_https
        _ -> @pools.song_http
      end

    [
      headers: [{"Cache-Control", "no-cache"}, {"Pragma", "no-cache"}],
      redirect: true,
      max_redirects: @max_redirects,
      finch: [name: pool[:name]]
    ]
    |> Keyword.merge(opts)
  end

  # value of the :finch option of Req
  def get_hls_finch(), do: [name: @pools.hls[:name]]

  # value of the :finch option of the Req adapter of the icecast library
  def get_icecast_finch_for(url) do
    case URI.parse(url) do
      %URI{scheme: "https"} -> [name: @pools.icecast_https[:name]]
      _ -> [name: @pools.icecast_http[:name]]
    end
  end

  # ----- Pool started by Req at each request -----

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
