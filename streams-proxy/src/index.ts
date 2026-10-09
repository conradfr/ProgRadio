// Inspired from https://gist.github.com/sixertoy/6b5433220a45aa754354287ff54a1e2a
// This has been converted to Hono / Typescript from the previous Express / Javascript version

// Shoutcast v1 servers respond with "ICY 200 OK" instead of "HTTP/1.0 200 OK", which no http client parses
// (browsers do): the status line is rewritten on the socket before it reaches the parser, see acceptIcyResponse()

import os from 'node:os'
import dns from 'node:dns'
import http from 'node:http'
import https from 'node:https'
import type net from 'node:net'
import { Readable } from 'node:stream'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { connectRedis, isValidKey } from './keys.js'

const serverPort = Number(process.env.PORT || process.env.PROXY_PORT || 3000)

// headers that no longer apply once the upstream response has been re-streamed
const skippedHeaders = ['connection', 'content-length', 'keep-alive', 'transfer-encoding']

const maxRedirects = 5

const icyStatusLine = Buffer.from('ICY ')
const httpStatusLine = Buffer.from('HTTP/1.0 ')

const app = new Hono()
const hostname = os.hostname()

// replaces the "ICY" of the status line by a http version in the first chunk received from the stream server
function acceptIcyResponse(socket: net.Socket): void {
  const push = socket.push

  socket.push = function (chunk: unknown, encoding?: BufferEncoding): boolean {
    socket.push = push

    if (Buffer.isBuffer(chunk) && chunk.subarray(0, icyStatusLine.length).equals(icyStatusLine)) {
      chunk = Buffer.concat([httpStatusLine, chunk.subarray(icyStatusLine.length)])
    }

    return push.call(socket, chunk, encoding)
  }
}

// fetch can't be used to get the stream: its http parser is strict and has no lenient mode,
// and a lot of old stream servers send malformed responses (e.g. a status line ending with LF instead of CRLF)
function requestStream(url: string, signal: AbortSignal, redirects = 0): Promise<http.IncomingMessage> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https://') ? https : http
    const options = { insecureHTTPParser: true, signal, headers: { 'user-agent': 'node' } }

    client.get(url, options, (res) => {
      const status = res.statusCode || 0
      const location = res.headers.location

      if (status >= 300 && status < 400 && location) {
        res.destroy()

        if (redirects >= maxRedirects) {
          reject(new Error('Too many redirects'))
          return
        }

        resolve(requestStream(new URL(location, url).href, signal, redirects + 1))
        return
      }

      resolve(res)
    }).on('socket', acceptIcyResponse).on('error', reject)
  })
}

app.use('/', cors({
  origin: (process.env.PROXY_CORS || '').split(','),
  allowMethods: ['GET', 'HEAD']
}))

app.get('/robots.txt', (c) => c.text("User-agent: *\nDisallow: /"))

app.get('/', async (c) => {
  const stream = c.req.query('stream')
  const streamUrl = typeof stream === 'string' ? stream.trim() : ''

  // redirect https stream requests as those don't need a cors proxy
  if (streamUrl.startsWith('https://')) {
    process.stdout.write(`Redirected: ${streamUrl}\n`)
    return c.redirect(streamUrl)
  }

  const apiKey = c.req.query('k')
  let apiKeyStatus = apiKey ? apiKey : 'none'

  if (apiKey) {
    if (await isValidKey(apiKey)) {
      apiKeyStatus = 'OK'
    } else {
      apiKeyStatus = 'wrong'
    }
  }

  process.stdout.write(`Request: ${stream} (key: ${apiKey}, status: ${apiKeyStatus})\n`)

  if (apiKeyStatus !== 'OK') {
    process.stdout.write(`Rejected: ${stream} (no key)\n`)
    return c.text('Error', 500)
  }

  // fetch would also accept other schemes (data:, blob:...)
  if (!streamUrl.startsWith('http://')) {
    process.stdout.write(`Error: ${stream}\n`)
    return c.text('Error', 500)
  }

  // the connection to the stream is closed by the server when the listener disconnects
  c.req.raw.signal.addEventListener('abort', () => {
    process.stdout.write(`End: ${stream}\n`)
  })

  try {
    const upstream = await requestStream(streamUrl, c.req.raw.signal)
    const status = upstream.statusCode || 0

    if (status < 200 || status > 299) {
      upstream.destroy()
      process.stdout.write(`Error: ${stream} (status: ${status})\n`)
      return c.text('Error', 500)
    }

    const headers = new Headers()

    for (let i = 0; i < upstream.rawHeaders.length; i += 2) {
      const name = upstream.rawHeaders[i]

      if (skippedHeaders.includes(name.toLowerCase())) {
        continue
      }

      try {
        headers.append(name, upstream.rawHeaders[i + 1])
      } catch {
        // the lenient parser lets invalid headers through, those are not forwarded
      }
    }

    if (c.req.method === 'HEAD') {
      upstream.destroy()
      return new Response(null, { status, headers })
    }

    return new Response(Readable.toWeb(upstream) as ReadableStream, { status, headers })
  } catch (error) {
    process.stdout.write(`Error: ${stream}\n`)
    return c.text('Error' + error, 500)
  }
})

connectRedis()

serve({
  fetch: app.fetch,
  port: serverPort
}, (info) => {
  dns.lookup(hostname, (err, ip) => {
    // retrieve network local ip
    process.stdout.write('Audio Proxy Server runs under\n')
    process.stdout.write(`  Local:        http://localhost:${info.port}\n`)
    process.stdout.write(`  Home Network: http://${ip}:${info.port}\n`)
  })
})

// node does not stop on those signals when it runs as PID 1 in docker
process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
