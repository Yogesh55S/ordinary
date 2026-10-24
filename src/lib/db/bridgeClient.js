import { BRIDGE_MODIFIERS, BRIDGE_VERBS } from './bridgeSchema';

/**
 * Browser-side stand-in for the supabase-js client.
 *
 * It exposes the same chainable API the workspace already uses
 * (`supabase.from('clients').select('*').eq('id', id).single()`), but instead of
 * talking to Supabase with the public anon key it records the chain and replays
 * it on the server (/api/db), where the owner session is checked and the
 * service-role key is used. The anon key never has to ship to the browser.
 */

const LOGIN_PATH = '/lancer-login';

function toError(message, extra = {}) {
  return { message, details: null, hint: null, code: extra.code ?? null };
}

function handleUnauthorized() {
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith(LOGIN_PATH)) {
    const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
    window.location.assign(`${LOGIN_PATH}?next=${next}`);
  }
}

// JSON turns trailing `undefined` args into `null`, which supabase-js treats differently.
function trimTrailingUndefined(args) {
  const out = [...args];
  while (out.length && out[out.length - 1] === undefined) out.pop();
  return out;
}

async function postJson(url, body) {
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'same-origin',
    });
  } catch (err) {
    return { data: null, error: toError(err?.message || 'Network error'), count: null, status: 0 };
  }
  return readResponse(res);
}

async function readResponse(res) {
  if (res.status === 401) {
    handleUnauthorized();
    return { data: null, error: toError('Session expired. Please log in again.', { code: '401' }), count: null, status: 401 };
  }
  try {
    const payload = await res.json();
    return {
      data: payload.data ?? null,
      error: payload.error ?? (res.ok ? null : toError(res.statusText || 'Request failed')),
      count: payload.count ?? null,
      status: payload.status ?? res.status,
      statusText: payload.statusText ?? res.statusText,
    };
  } catch (_) {
    return { data: null, error: toError(`Unexpected response (${res.status})`), count: null, status: res.status };
  }
}

class BridgeQuery {
  constructor(table) {
    this.table = table;
    this.ops = [];
    this.throwErrors = false;
  }

  throwOnError() {
    this.throwErrors = true;
    return this;
  }

  async execute() {
    const result = await postJson('/api/db', { table: this.table, ops: this.ops });
    if (this.throwErrors && result.error) {
      throw Object.assign(new Error(result.error.message), result.error);
    }
    return result;
  }

  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this.execute().catch(onRejected);
  }

  finally(onFinally) {
    return this.execute().finally(onFinally);
  }
}

// Mutable chaining (like supabase-js): every call appends an op and returns the same query.
for (const method of [...BRIDGE_VERBS, ...BRIDGE_MODIFIERS]) {
  BridgeQuery.prototype[method] = function chain(...args) {
    this.ops.push({ method, args: trimTrailingUndefined(args) });
    return this;
  };
}

function storageBucket(bucket) {
  return {
    async upload(path, file, options = {}) {
      const form = new FormData();
      form.append('bucket', bucket);
      form.append('path', path);
      form.append('file', file);
      if (options.cacheControl) form.append('cacheControl', String(options.cacheControl));
      if (options.upsert) form.append('upsert', 'true');
      if (options.contentType) form.append('contentType', options.contentType);

      try {
        const res = await fetch('/api/db/storage', { method: 'POST', body: form, credentials: 'same-origin' });
        return readResponse(res);
      } catch (err) {
        return { data: null, error: toError(err?.message || 'Network error') };
      }
    },

    async remove(paths) {
      return postJson('/api/db/storage', { action: 'remove', bucket, paths });
    },

    // Public URLs are deterministic, so no round-trip is needed (same format as supabase-js).
    getPublicUrl(path) {
      const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
      const cleanPath = String(path).replace(/^\/+/, '');
      return { data: { publicUrl: `${base}/storage/v1/object/public/${bucket}/${cleanPath}` } };
    },
  };
}

export function createBridgeClient() {
  return {
    from(table) {
      return new BridgeQuery(table);
    },
    storage: {
      from: storageBucket,
    },
  };
}
