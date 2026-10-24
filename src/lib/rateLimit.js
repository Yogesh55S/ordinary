/**
 * Small fixed-window rate limiter kept in process memory.
 *
 * Fits this project's deployment (one long-running Node server next to the
 * Baileys/pm2 workers). On a multi-instance or serverless host each instance
 * keeps its own counters; swap the Map for Redis/Upstash there.
 */

const buckets = new Map();
const MAX_KEYS = 10_000;

function sweep(now) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Counts one hit for `key`.
 * @returns {{ allowed: boolean, remaining: number, retryAfterSeconds: number }}
 */
export function hit(key, { limit, windowMs }) {
  const now = Date.now();
  if (buckets.size > MAX_KEYS) sweep(now);

  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;

  return {
    allowed: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

/** Reads a key's state without counting a hit. */
export function peek(key, { limit }) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    return { allowed: true, remaining: limit, retryAfterSeconds: 0 };
  }
  return {
    allowed: bucket.count < limit,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

export function reset(key) {
  buckets.delete(key);
}
