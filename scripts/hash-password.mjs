// Turns your admin password into the value for ADMIN_PASSWORD_HASH.
// Usage: pnpm admin:hash 'your-password'
//
// The bcrypt hash is base64-encoded because it contains "$" characters,
// which .env files and Vercel would otherwise try to expand.
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error("Give a password of at least 12 characters: pnpm admin:hash 'your-password'");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log(`ADMIN_PASSWORD_HASH=${Buffer.from(hash).toString("base64")}`);
