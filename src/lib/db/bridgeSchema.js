/**
 * What the workspace is allowed to do through the authenticated data bridge
 * (/api/db and /api/db/storage). Shared by the browser client and the server
 * so both sides agree on the contract.
 */

export const BRIDGE_TABLES = new Set([
  'activity_logs',
  'clients',
  'job_application_settings',
  'job_email_template',
  'job_hr_contacts',
  'job_profiles',
  'media',
  'outreach_schedules',
  'templates',
]);

export const BRIDGE_BUCKETS = new Set(['outreach-media']);

// Methods that start a query.
export const BRIDGE_VERBS = new Set(['select', 'insert', 'update', 'upsert', 'delete']);

// Filters and modifiers that may follow a verb.
export const BRIDGE_MODIFIERS = new Set([
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'like',
  'ilike',
  'is',
  'in',
  'contains',
  'containedBy',
  'match',
  'not',
  'or',
  'filter',
  'textSearch',
  'order',
  'limit',
  'range',
  'single',
  'maybeSingle',
]);

export const BRIDGE_MAX_OPS = 40;
export const BRIDGE_MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
