const Redis = require('ioredis');

// Small TTL cache. Uses Redis when REDIS_URL is set, otherwise an in-process Map.
const memory = new Map();
const MAX_MEMORY_ENTRIES = 2000;

let redis = null;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 1, lazyConnect: false });
  redis.on('error', (err) => console.error('Redis error:', err.message));
}

const stats = { hits: 0, misses: 0 };

async function get(key) {
  if (redis && redis.status === 'ready') {
    try {
      const raw = await redis.get(key);
      return raw ? JSON.parse(raw) : undefined;
    } catch {
      return undefined;
    }
  }
  const entry = memory.get(key);
  if (!entry) return undefined;
  if (entry.expires < Date.now()) {
    memory.delete(key);
    return undefined;
  }
  return entry.value;
}

async function set(key, value, ttlSeconds) {
  if (redis && redis.status === 'ready') {
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // cache failures must never break a request
    }
    return;
  }
  if (memory.size >= MAX_MEMORY_ENTRIES) {
    memory.delete(memory.keys().next().value); // evict oldest
  }
  memory.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
}

// Return the cached value for `key`, or compute it with `loader` and cache it.
async function wrap(key, ttlSeconds, loader) {
  const cached = await get(key);
  if (cached !== undefined) {
    stats.hits += 1;
    return cached;
  }
  stats.misses += 1;
  const value = await loader();
  await set(key, value, ttlSeconds);
  return value;
}

function clear() {
  memory.clear();
}

module.exports = { get, set, wrap, clear, stats };
