const { Pool } = require("pg");

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/subscription_tracker";

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  // Backward compatibility for earlier schema versions that used email.
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT");

  const legacyEmailColumn = await pool.query(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'email'
    ) AS exists
  `);

  if (legacyEmailColumn.rows[0].exists) {
    await pool.query(`
      UPDATE users
      SET username = LOWER(SPLIT_PART(email, '@', 1) || '_' || id)
      WHERE username IS NULL
    `);
  }

  await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS users_username_key ON users (username)");
}

module.exports = {
  pool,
  initDb,
};
