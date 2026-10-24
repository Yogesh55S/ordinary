/**
 * Generates the owner login secrets for .env.local.
 *
 *   npm run hash-password -- "your-strong-password"
 *
 * Prints OWNER_PASSWORD_HASH_B64 (bcrypt, cost 12, base64 so "$" never gets
 * mangled by .env expansion) plus fresh AUTH_SECRET / WORKER_SECRET values.
 * The password itself is never stored.
 */
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

async function main() {
  const password = process.argv[2];
  if (!password || password.length < 12) {
    console.error('Usage: npm run hash-password -- "<password of at least 12 characters>"');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  const b64 = Buffer.from(hash, 'utf8').toString('base64');

  console.log('\nAdd these lines to .env.local (and to your host\'s environment variables):\n');
  console.log(`OWNER_PASSWORD_HASH_B64=${b64}`);
  console.log(`AUTH_SECRET=${crypto.randomBytes(48).toString('base64url')}`);
  console.log(`WORKER_SECRET=${crypto.randomBytes(32).toString('base64url')}`);
  console.log('\nKeep AUTH_SECRET / WORKER_SECRET if you already have them — changing AUTH_SECRET logs out every session.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
