/**
 * Migration runner
 *
 * Run: node scripts/migrate.js
 *
 * This will:
 * 1) Ensure required extensions
 * 2) Apply base schema (scripts/schema.sql)
 * 3) Apply optional feature migrations (credits, payments)
 */

const fs = require('fs');
const path = require('path');
const { initializePool, close } = require('../src/config/database');

function readSql(file) {
  return fs.readFileSync(path.join(__dirname, file), 'utf8');
}

async function runSql(pool, sql, label) {
  if (!sql || !sql.trim()) return;
  console.log(`\n==> ${label}`);
  await pool.query(sql);
  console.log(`✅ ${label} applied`);
}

async function migrate() {
  const pool = initializePool();
  if (!pool) {
    console.error('Database not configured. Set DATABASE_URL.');
    process.exit(1);
  }

  try {
    // Extensions used across schema/migrations
    await runSql(pool, 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\nCREATE EXTENSION IF NOT EXISTS pgcrypto;', 'extensions');

    // Base schema
    await runSql(pool, readSql('schema.sql'), 'base schema');

    // Credits system
    const creditsSql = readSql('migrate-credits.sql');
    await runSql(pool, creditsSql, 'credits schema');

    // Payments schema (optional)
    const paymentsSql = readSql('migrate-payments.sql');
    await runSql(pool, paymentsSql, 'payments schema');

    console.log('\n🎉 All migrations complete');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await close();
  }
}

migrate();
