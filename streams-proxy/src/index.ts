// Inspired from https://gist.github.com/sixertoy/6b5433220a45aa754354287ff54a1e2a
// This has been converted to Hono / Typescript from the previous Express / Javascript version

// Shoutcast servers will not work as they respond with "ICY 200 OK"
// Couldn't find a simple way to override parsing of different http clients
// todo: fork?

import os from 'node:os'
import dns from 'node:dns'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { connectRedis, isValidKey } from './keys.js'

const serverPort = Number(process.env.PORT || process.env.PROXY_PORT || 3000)

// headers that no longer apply once the upstream response has been decoded and re-streamed
const skippedHeaders = ['connection', 'content-encoding', 'content-length', 'keep-alive', 'transfer-encoding']

const app = new Hono()
const hostname = os.hostname()

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
    const upstream = await fetch(streamUrl)

    if (!upstream.ok) {
      await upstream.body?.cancel()
      process.stdout.write(`Error: ${stream} (status: ${upstream.status})\n`)
      return c.text('Error', 500)
    }

    const headers = new Headers(upstream.headers)
    skippedHeaders.forEach((header) => headers.delete(header))

    if (c.req.method === 'HEAD') {
      await upstream.body?.cancel()
      return new Response(null, { status: upstream.status, headers })
    }

    return new Response(upstream.body, { status: upstream.status, headers })
  } catch (error) {
    process.stdout.write(`Error: ${stream}\n`)
    return c.text('Error', 500)
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
