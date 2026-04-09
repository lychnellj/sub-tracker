const dns = require("node:dns");
const { Pool } = require("pg");

dns.setDefaultResultOrder("ipv4first");

const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/subscription_tracker";

function usingDirectSupabaseHost() {
  try {
    const parsed = new URL(DATABASE_URL);
    return parsed.hostname.startsWith("db.") && parsed.hostname.endsWith("supabase.co") && parsed.port === "5432";
  } catch {
    return false;
  }
}

const pool = new Pool({
	connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  // Force IPv4 socket preference; avoids ENETUNREACH on platforms without IPv6 egress.
  family: 4
});

async function initDb() {
  if (usingDirectSupabaseHost()) {
    console.warn(
      "DATABASE_URL appears to use direct Supabase host on port 5432. " +
        "For Railway runtime, prefer Supabase pooler URL on port 6543 with sslmode=require."
    );
  }

	await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

	await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT");

	await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS users_username_key ON users (username)");
}

module.exports = {
	pool,
	initDb
};
