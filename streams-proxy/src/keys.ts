import { createClient } from 'redis'

// rolling keys
const REDIS_KEY = 'stream_proxy_keys'
const CACHE_TTL_MS = 60_000

const database = Number(process.env.REDIS_DB || 0)

// REDIS_URL takes precedence, otherwise the same variables as the api are used
const client = createClient({
  ...(process.env.REDIS_URL
    ? { url: process.env.REDIS_URL }
    : {
        socket: {
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: Number(process.env.REDIS_PORT || 6379)
        },
        password: process.env.REDIS_PASSWORD || undefined,
        database
      }),
  // fail right away when redis is down instead of holding the requests
  disableOfflineQueue: true
})

client.on('error', (error: Error) => {
  process.stdout.write(`Redis error: ${error.message}\n`)
})

client.on('ready', () => {
  process.stdout.write('Redis: connected\n')
})

let keys = new Set<string>()
let fetchedAt = 0

async function refreshKeys(): Promise<void> {
  try {
    keys = new Set(await client.lRange(REDIS_KEY, 0, -1))
    fetchedAt = Date.now()
  } catch (error) {
    // we keep the last known keys if redis is unavailable
    process.stdout.write(`Redis error: could not refresh keys (${(error as Error).message})\n`)
  }
}

export function connectRedis(): void {
  // the client reconnects by itself, the server must start even if redis is not there yet
  client.connect().catch((error: Error) => {
    process.stdout.write(`Redis error: ${error.message}\n`)
  })
}

export async function isValidKey(key: string): Promise<boolean> {
  if (Date.now() - fetchedAt < CACHE_TTL_MS && keys.has(key)) {
    return true
  }

  // unknown key or expired cache: the key may have just been generated
  await refreshKeys()

  return keys.has(key)
}
