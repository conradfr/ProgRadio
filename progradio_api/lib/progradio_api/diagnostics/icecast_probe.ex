defmodule ProgradioApi.Diagnostics.IcecastProbe do
  @moduledoc """
  Timing probe for the icecast/shoutcast metadata poll, to find where the
  hackney 4 wall-clock actually goes.

  Meant to be driven from a remote iex session against the running node:

      alias ProgradioApi.Diagnostics.IcecastProbe, as: P

      P.dns("https://ice.creacast.com/sudradio")
      P.tcp("https://ice.creacast.com/sudradio")
      P.tls("https://ice.creacast.com/sudradio")
      P.poll("https://ice.creacast.com/sudradio", 5)
      P.all("https://ice.creacast.com/sudradio")

  Every function prints a report and returns the raw measurements, so you can
  keep the term around for comparison.
  """

  # Same options Shoutcast.read_meta/3 ends up using.
  @hackney_opts [pool: false, protocols: [:http1]]
  @icy_headers [{"Icy-MetaData", "1"}]
  @redirect_status [301, 302, 303, 307, 308]

  # hackney_happy's fixed wait before it races IPv4 (hackney_happy.erl:9).
  @happy_eyeballs_delay_ms 250

  @doc """
  Run every probe in order against `url`. Start here.
  """
  def all(url, samples \\ 5) do
    %{
      dns: dns(url),
      tcp: tcp(url),
      tls: tls(url),
      poll: poll(url, samples, delay_ms: 20_000)
    }
  end

  # --------------------------------------------------------------------------
  # DNS
  # --------------------------------------------------------------------------

  @doc """
  Time the two lookups hackney_happy does per connect.

  `hackney_happy:getaddrs/1` resolves AAAA then A, sequentially, through
  `:inet_res` (Erlang's own resolver -- it does not use the OS resolver cache).
  Both are paid on every single connection.
  """
  def dns(url) do
    host = host_charlist(url)

    {aaaa_us, aaaa} = :timer.tc(fn -> getbyname(host, :aaaa) end)
    {a_us, a} = :timer.tc(fn -> getbyname(host, :a) end)
    {os_us, os} = :timer.tc(fn -> :inet.getaddr(host, :inet) end)

    result = %{
      host: to_string(host),
      aaaa: aaaa,
      aaaa_us: aaaa_us,
      a: a,
      a_us: a_us,
      os_resolver_us: os_us,
      os_resolver: os,
      total_us: aaaa_us + a_us,
      happy_eyeballs_applies: aaaa != [] and a != []
    }

    title("DNS  (#{result.host})")
    row("AAAA (:inet_res)", aaaa_us, inspect(aaaa))
    row("A    (:inet_res)", a_us, inspect(a))
    row("hackney total", result.total_us, "both lookups, every connect")
    row("OS resolver ref", os_us, inspect(os))

    if result.happy_eyeballs_applies do
      note(
        "Host has BOTH AAAA and A records -> hackney tries IPv6 first and waits " <>
          "#{@happy_eyeballs_delay_ms}ms before racing IPv4. See tcp/1 for whether IPv6 works."
      )
    else
      note("Only one address family -> no #{@happy_eyeballs_delay_ms}ms happy-eyeballs wait.")
    end

    result
  end

  # --------------------------------------------------------------------------
  # TCP
  # --------------------------------------------------------------------------

  @doc """
  Raw TCP connect to each resolved address, IPv6 and IPv4 separately.

  This is the one that matters: if AAAA records exist but the IPv6 connect
  fails or is slow, every hackney connect pays the #{@happy_eyeballs_delay_ms}ms
  wait before it falls back to IPv4.
  """
  def tcp(url) do
    uri = URI.parse(url)
    host = host_charlist(url)
    port = port_for(uri)

    v6 = Enum.map(getbyname(host, :aaaa), &time_tcp(&1, port, :inet6))
    v4 = Enum.map(getbyname(host, :a), &time_tcp(&1, port, :inet))

    title("TCP  (#{uri.host}:#{port})")
    Enum.each(v6, &print_connect/1)
    Enum.each(v4, &print_connect/1)

    result = %{ipv6: v6, ipv4: v4}
    diagnose_tcp(result)
    result
  end

  defp time_tcp(addr, port, family) do
    opts = [:binary, {:active, false}, {:packet, :raw}, family]
    {us, res} = :timer.tc(fn -> :gen_tcp.connect(addr, port, opts, 5_000) end)

    case res do
      {:ok, sock} ->
        :gen_tcp.close(sock)
        %{family: family, addr: addr, us: us, ok: true, error: nil}

      {:error, reason} ->
        %{family: family, addr: addr, us: us, ok: false, error: reason}
    end
  end

  defp diagnose_tcp(%{ipv6: [], ipv4: _}) do
    note("No AAAA records -> IPv4 only, no happy-eyeballs penalty.")
  end

  defp diagnose_tcp(%{ipv6: v6, ipv4: v4}) do
    cond do
      Enum.any?(v6, & &1.ok) ->
        note("IPv6 connects. hackney will use it and skip the #{@happy_eyeballs_delay_ms}ms wait.")

      v4 == [] ->
        note("IPv6 fails and there is no IPv4 fallback -- this host is unreachable.")

      true ->
        note(
          "IPv6 records exist but the connect FAILS. Every hackney connect to this host " <>
            "burns #{@happy_eyeballs_delay_ms}ms waiting before trying IPv4. This is your regression."
        )
    end
  end

  # --------------------------------------------------------------------------
  # TLS
  # --------------------------------------------------------------------------

  @doc """
  Cost of the TLS handshake, and what the lost `insecure: true` is worth.

  Runs four handshakes: verify_peer (hackney 4's current behaviour) and
  verify_none (what `insecure: true` used to give you in hackney 1), twice
  each. The second run of a pair shows whether TLS 1.3 session resumption is
  engaging -- a resumed handshake skips certificate validation entirely.
  """
  def tls(url) do
    uri = URI.parse(url)

    if uri.scheme != "https" do
      title("TLS  (#{uri.host})")
      note("Plain HTTP -- no handshake, nothing to measure here.")
      %{scheme: uri.scheme, skipped: true}
    else
      host = host_charlist(url)
      port = port_for(uri)

      runs =
        for mode <- [:verify_peer, :verify_none], pass <- 1..2 do
          %{mode: mode, pass: pass, us: time_tls(host, port, mode)}
        end

      title("TLS  (#{uri.host}:#{port})")
      Enum.each(runs, fn r -> row("#{r.mode} ##{r.pass}", r.us, "") end)

      peer = Enum.filter(runs, &(&1.mode == :verify_peer))
      none = Enum.filter(runs, &(&1.mode == :verify_none))
      diagnose_tls(peer, none)

      %{runs: runs}
    end
  end

  defp time_tls(host, port, mode) do
    # Mirrors hackney_ssl:check_hostname_opts/1 for verify_peer, minus the
    # partial_chain fun (which only ever makes it slower, never faster).
    verify =
      case mode do
        :verify_none ->
          [verify: :verify_none]

        :verify_peer ->
          [
            verify: :verify_peer,
            depth: 100,
            cacerts: :certifi.cacerts(),
            customize_hostname_check: [
              match_fun: :public_key.pkix_verify_hostname_match_fun(:https)
            ]
          ]
      end

    opts = [:binary, {:active, false}, {:packet, :raw}, {:session_tickets, :auto}] ++ verify

    {us, res} = :timer.tc(fn -> :ssl.connect(host, port, opts, 10_000) end)

    case res do
      {:ok, sock} -> :ssl.close(sock)
      _ -> :ok
    end

    us
  end

  defp diagnose_tls(peer, none) do
    peer_warm = peer |> List.last() |> Map.get(:us)
    peer_cold = peer |> List.first() |> Map.get(:us)
    none_warm = none |> List.last() |> Map.get(:us)

    if peer_warm < peer_cold * 0.7 do
      note("verify_peer got #{pct(peer_cold, peer_warm)}% cheaper on the 2nd pass -- session resumption is working.")
    else
      note(
        "verify_peer did NOT get cheaper on the 2nd pass -- session resumption is probably " <>
          "not engaging (server may not issue TLS 1.3 tickets). Every poll pays a full verifying handshake."
      )
    end

    note("Re-adding `insecure` would save ~#{div(peer_warm - none_warm, 1000)}ms/handshake, but it disables resumption (hackney_ssl.erl:117).")

    note(
      "Caveat: this probe handshakes without ALPN, so its resumption behaviour is not " <>
        "gated on hackney's ALPN memo. Trust poll/2 for the real steady state; trust this " <>
        "for the verify_peer vs verify_none delta."
    )
  end

  # --------------------------------------------------------------------------
  # Full poll
  # --------------------------------------------------------------------------

  @doc """
  Time a complete metadata poll the way `Shoutcast.read_meta/3` does it,
  broken into phases, `samples` times.

  Redirects are followed and each hop timed separately -- a stream that 302s
  pays the whole connect cost twice.

  The first sample is cold (full TLS handshake, cold DNS). Later samples show
  the steady state, which is what your 10-30s poll loop actually experiences.
  """
  def poll(url, samples \\ 5, opts \\ []) do
    delay = Keyword.get(opts, :delay_ms, 0)

    title("POLL (#{samples} samples, #{delay}ms apart)")

    if delay < 5_000 and samples > 1 do
      note(
        "WARNING: back-to-back polls. Origins throttle repeat connections, so `request` " <>
          "will inflate and will NOT match production. Pass delay_ms: 20_000 to match your poll loop."
      )
    end

    results =
      Enum.map(1..samples, fn i ->
        if i > 1 and delay > 0, do: Process.sleep(delay)
        r = one_poll(url)
        print_poll(i, r)
        print_body_detail(r)
        r
      end)

    totals = Enum.map(results, & &1.total_us)

    note(
      "cold=#{ms(List.first(totals))}ms  " <>
        "warm_median=#{ms(median(tl(totals)))}ms  " <>
        "min=#{ms(Enum.min(totals))}ms  max=#{ms(Enum.max(totals))}ms"
    )

    results
  end

  defp one_poll(url), do: one_poll(url, 0, [])

  defp one_poll(url, redirects, hops) when redirects <= 5 do
    {connect_us, connect_res} =
      :timer.tc(fn -> :hackney.connect(url, @hackney_opts) end)

    case connect_res do
      {:error, reason} ->
        finish(hops ++ [%{url: url, phase: :connect, error: reason, connect_us: connect_us}])

      {:ok, conn} ->
        {req_us, req_res} =
          :timer.tc(fn ->
            :hackney.send_request(conn, {:get, request_path(url), @icy_headers, ""})
          end)

        case req_res do
          {:ok, status, headers, ^conn} when status in @redirect_status ->
            :hackney.close(conn)
            hop = %{url: url, status: status, connect_us: connect_us, request_us: req_us, body_us: 0}

            case header(headers, "location") do
              nil ->
                finish(hops ++ [Map.put(hop, :error, :no_location)])

              loc ->
                url |> URI.merge(loc) |> URI.to_string() |> one_poll(redirects + 1, hops ++ [hop])
            end

          {:ok, status, headers, ^conn} ->
            {body_us, body} = :timer.tc(fn -> read_meta_block(conn, offset(headers)) end)
            :hackney.close(conn)

            {meta, chunks} =
              case body do
                {:ok, m, c} -> {{:ok, m}, c}
                other -> {other, []}
              end

            hop = %{
              url: url,
              status: status,
              connect_us: connect_us,
              request_us: req_us,
              body_us: body_us,
              metaint: offset(headers),
              meta: meta,
              chunks: chunks,
              first_byte_us: chunks |> List.first({0, 0}) |> elem(0),
              chunk_count: length(chunks),
              bytes: chunks |> Enum.map(&elem(&1, 1)) |> Enum.sum()
            }

            finish(hops ++ [hop])

          other ->
            :hackney.close(conn)
            finish(hops ++ [%{url: url, phase: :request, error: other, connect_us: connect_us, request_us: req_us}])
        end
    end
  end

  defp one_poll(url, redirects, hops) do
    finish(hops ++ [%{url: url, error: {:max_redirect, redirects}}])
  end

  defp finish(hops) do
    sum = fn key -> Enum.reduce(hops, 0, &(Map.get(&1, key, 0) + &2)) end

    %{
      hops: hops,
      redirects: length(hops) - 1,
      connect_us: sum.(:connect_us),
      request_us: sum.(:request_us),
      body_us: sum.(:body_us),
      total_us: sum.(:connect_us) + sum.(:request_us) + sum.(:body_us)
    }
  end

  # Same two-pass read Shoutcast does: to the length byte, then the block.
  defp read_meta_block(_conn, nil), do: {:error, :no_metaint}

  defp read_meta_block(conn, offset) do
    with {:ok, data, s1} <- read(conn, [], 0, offset + 1, []),
         <<_::binary-size(offset), l, _::binary>> <- data,
         meta_length = l * 16,
         {:ok, data, s2} <- read(conn, [data], byte_size(data), offset + 1 + meta_length, s1),
         <<_::binary-size(offset), _, meta::binary-size(meta_length), _::binary>> <- data do
      {:ok, String.trim(meta, <<0>>), s2}
    else
      {:error, reason} -> {:error, reason}
      _ -> {:error, :truncated}
    end
  end

  # Each entry is {microseconds_waited, bytes_returned} for one stream_body call,
  # so we can tell "server took N ms to start sending" from "stream is slow".
  defp read(_conn, acc, size, needed, stats) when size >= needed do
    {:ok, acc |> Enum.reverse() |> IO.iodata_to_binary(), Enum.reverse(stats)}
  end

  defp read(conn, acc, size, needed, stats) do
    {us, res} = :timer.tc(fn -> :hackney.stream_body(conn) end)

    case res do
      {:ok, data} ->
        read(conn, [data | acc], size + byte_size(data), needed, [{us, byte_size(data)} | stats])

      :done ->
        {:error, :truncated}

      {:error, reason} ->
        {:error, reason}
    end
  end

  # --------------------------------------------------------------------------
  # Consecutive metadata blocks
  # --------------------------------------------------------------------------

  @doc """
  Hold ONE connection open and read `n` consecutive metadata blocks, timing each.

  This answers the two questions the poll numbers raise:

    * how long a metadata block actually costs once the stream is flowing
      (vs. the one-off cost of getting the stream started), and
    * whether the FIRST block after connecting is empty. In icy, a zero-length
      block means "title unchanged"; if this station only sends the title on
      change, a fresh connection that reads one block gets nothing, and
      reconnecting every poll can never see a title.
  """
  def blocks(url, n \\ 10) do
    title("BLOCKS (#{n} consecutive, one connection)")
    do_blocks(url, n, 0)
  end

  defp do_blocks(url, _n, redirects) when redirects > 5 do
    note("too many redirects at #{url}")
    {:error, :max_redirect}
  end

  defp do_blocks(url, n, redirects) do
    case :hackney.connect(url, @hackney_opts) do
      {:error, reason} ->
        note("connect failed: #{inspect(reason)}")
        {:error, reason}

      {:ok, conn} ->
        case :hackney.send_request(conn, {:get, request_path(url), @icy_headers, ""}) do
          {:ok, status, headers, ^conn} when status in @redirect_status ->
            :hackney.close(conn)

            case header(headers, "location") do
              nil ->
                note("#{status} with no Location header")
                {:error, :no_location}

              loc ->
                target = url |> URI.merge(loc) |> URI.to_string()
                note("#{status} -> #{target}")
                do_blocks(target, n, redirects + 1)
            end

          {:ok, 200, headers, ^conn} ->
            try do
              case offset(headers) do
                nil ->
                  note("no icy-metaint header -- this stream sends no metadata at all.")
                  {:error, :no_metaint}

                metaint ->
                  note("icy-metaint=#{metaint} (a block every #{metaint} bytes of audio)")
                  read_blocks(conn, <<>>, metaint, 1, n, [])
              end
            after
              :hackney.close(conn)
            end

          other ->
            :hackney.close(conn)
            note("unexpected response: #{inspect(other)}")
            {:error, other}
        end
    end
  end

  defp read_blocks(_conn, _buf, _metaint, i, n, acc) when i > n do
    results = Enum.reverse(acc)
    summarise_blocks(results)
    results
  end

  defp read_blocks(conn, buf, metaint, i, n, acc) do
    {us, res} = :timer.tc(fn -> one_block(conn, buf, metaint) end)

    case res do
      {:ok, meta, rest} ->
        IO.puts(
          "  ##{String.pad_trailing("#{i}", 3)}" <>
            " #{String.pad_leading("#{ms(us)}", 8)} ms   " <>
            if(meta == "", do: "(empty -- unchanged)", else: inspect(meta))
        )

        read_blocks(conn, rest, metaint, i + 1, n, [%{i: i, us: us, meta: meta} | acc])

      {:error, reason} ->
        note("stopped at block #{i}: #{inspect(reason)}")
        results = Enum.reverse(acc)
        summarise_blocks(results)
        results
    end
  end

  defp summarise_blocks([]), do: :ok

  defp summarise_blocks(results) do
    times = Enum.map(results, & &1.us)
    titled = Enum.reject(results, &(&1.meta == ""))

    note("per-block cost: median #{ms(median(times))}ms  min #{ms(Enum.min(times))}ms  max #{ms(Enum.max(times))}ms")

    case titled do
      [] ->
        note(
          "NO block carried a title in #{length(results)} reads. Either nothing is playing, " <>
            "or this station never repeats the title -- in which case a reconnect-per-poll " <>
            "strategy can never read it, no matter how long you wait."
        )

      [%{i: 1} | _] ->
        note("Block 1 carried the title -- reconnecting per poll works for this station.")

      [%{i: first} | _] ->
        note(
          "Block 1 was EMPTY; the title first appeared at block #{first}. Reading a single " <>
            "block after connecting misses it. That is why the poll returns \"\"."
        )
    end
  end

  # One metadata block: skip `metaint` bytes of audio, read the length byte,
  # then the block itself.
  defp one_block(conn, buf, metaint) do
    with {:ok, _audio, buf} <- take(conn, buf, metaint),
         {:ok, <<l>>, buf} <- take(conn, buf, 1),
         {:ok, meta, buf} <- take(conn, buf, l * 16) do
      {:ok, String.trim(meta, <<0>>), buf}
    end
  end

  defp take(_conn, buf, n) when byte_size(buf) >= n do
    <<taken::binary-size(n), rest::binary>> = buf
    {:ok, taken, rest}
  end

  defp take(conn, buf, n) do
    case :hackney.stream_body(conn) do
      {:ok, data} -> take(conn, buf <> data, n)
      :done -> {:error, :truncated}
      {:error, reason} -> {:error, reason}
    end
  end

  # --------------------------------------------------------------------------
  # Helpers
  # --------------------------------------------------------------------------

  defp getbyname(host, type) do
    case :inet_res.getbyname(host, type) do
      {:ok, hostent} -> elem(hostent, 5)
      {:error, _} -> []
    end
  rescue
    _ -> []
  end

  defp host_charlist(url), do: url |> URI.parse() |> Map.fetch!(:host) |> to_charlist()

  defp port_for(%URI{port: port}) when is_integer(port), do: port
  defp port_for(%URI{scheme: "https"}), do: 443
  defp port_for(_), do: 80

  defp request_path(url) do
    uri = URI.parse(url)

    case {uri.path || "/", uri.query} do
      {path, nil} -> path
      {path, qs} -> path <> "?" <> qs
    end
  end

  defp header(headers, name) do
    name = String.downcase(name)

    Enum.find_value(headers, fn {k, v} ->
      if String.downcase(to_string(k)) == name, do: to_string(v)
    end)
  end

  defp offset(headers) do
    case header(headers, "icy-metaint") do
      nil ->
        nil

      value ->
        case Integer.parse(String.trim(value)) do
          {n, _} -> n
          :error -> nil
        end
    end
  end

  defp median([]), do: 0

  defp median(list) do
    sorted = Enum.sort(list)
    Enum.at(sorted, div(length(sorted), 2))
  end

  defp ms(us), do: Float.round(us / 1000, 1)

  defp pct(from, to), do: round((from - to) / from * 100)

  # --------------------------------------------------------------------------
  # Output
  # --------------------------------------------------------------------------

  defp title(text) do
    IO.puts("\n== #{text} " <> String.duplicate("=", max(0, 60 - String.length(text))))
  end

  defp row(label, us, extra) do
    IO.puts("  #{String.pad_trailing(label, 20)} #{String.pad_leading("#{ms(us)}", 8)} ms   #{extra}")
  end

  defp note(text), do: IO.puts("  -> #{text}")

  defp print_connect(%{ok: true} = c) do
    row("#{c.family} connect", c.us, "#{:inet.ntoa(c.addr)}  OK")
  end

  defp print_connect(%{ok: false} = c) do
    row("#{c.family} connect", c.us, "#{:inet.ntoa(c.addr)}  FAILED (#{inspect(c.error)})")
  end

  defp print_body_detail(%{hops: hops}) do
    hop = List.last(hops)

    case hop do
      %{chunks: chunks, metaint: metaint} when chunks != [] ->
        shape =
          chunks
          |> Enum.map(fn {us, bytes} -> "#{ms(us)}ms/#{bytes}B" end)
          |> Enum.join("  ")

        IO.puts("       metaint=#{metaint}  meta=#{inspect(elem(hop.meta, 1))}  chunks: #{shape}")

      _ ->
        :ok
    end
  end

  defp print_body_detail(_), do: :ok

  defp print_poll(i, r) do
    extra =
      case r.redirects do
        0 -> ""
        n -> "  (#{n} redirect#{if n > 1, do: "s"})"
      end

    IO.puts(
      "  ##{String.pad_trailing("#{i}", 3)}" <>
        " connect #{String.pad_leading("#{ms(r.connect_us)}", 7)}ms" <>
        "  request #{String.pad_leading("#{ms(r.request_us)}", 6)}ms" <>
        "  body #{String.pad_leading("#{ms(r.body_us)}", 6)}ms" <>
        "  total #{String.pad_leading("#{ms(r.total_us)}", 7)}ms" <> extra
    )
  end
end
