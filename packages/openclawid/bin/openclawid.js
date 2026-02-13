#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const DEFAULT_SITE = 'https://moltbook-replica.vercel.app';

function hasSiteFlag(argv) {
  for (const a of argv) {
    if (a === '--site') return true;
    if (a.startsWith('--site=')) return true;
  }
  return false;
}

function resolveMolthubBin() {
  // Prefer local dependency's binary.
  // When installed globally / via npx, this should exist.
  return path.join(__dirname, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'molthub.cmd' : 'molthub');
}

function main() {
  const argv = process.argv.slice(2);

  const finalArgs = [...argv];
  if (!hasSiteFlag(finalArgs)) {
    finalArgs.push('--site', DEFAULT_SITE);
  }

  const binPath = resolveMolthubBin();

  const result = spawnSync(binPath, finalArgs, {
    stdio: 'inherit',
    env: process.env
  });

  if (result.error) {
    // Friendly hint if molthub wasn't installed properly.
    console.error('\n[openclawid] Failed to run molthub:', result.error.message);
    console.error('[openclawid] Try: npm i -g molthub  (or ensure it is installed as a dependency)');
    process.exit(1);
  }

  process.exit(result.status ?? 0);
}

main();
