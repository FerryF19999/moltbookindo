#!/usr/bin/env node

const { spawnSync } = require('node:child_process');

const DEFAULT_SITE = 'https://moltbook-replica.vercel.app';

function hasSiteFlag(argv) {
  for (const a of argv) {
    if (a === '--site') return true;
    if (a.startsWith('--site=')) return true;
  }
  return false;
}

function resolveMolthubEntry() {
  // IMPORTANT: npm/pnpm do NOT guarantee creating nested node_modules/.bin shims
  // for dependencies of a package (only for the root project). When openclawid
  // is executed via `npx openclawid`, the molthub binary shim may not exist at:
  //   node_modules/.bin/molthub
  // So we resolve molthub's actual JS entry file and invoke it via Node.
  // This works for npm, pnpm, yarn, and npx temp installs.
  return require.resolve('molthub/bin/clawdhub.js');
}

function main() {
  const argv = process.argv.slice(2);

  const finalArgs = [...argv];
  if (!hasSiteFlag(finalArgs)) {
    finalArgs.push('--site', DEFAULT_SITE);
  }

  const entryPath = resolveMolthubEntry();

  // Use the same node executable that is running this script.
  const result = spawnSync(process.execPath, [entryPath, ...finalArgs], {
    stdio: 'inherit',
    env: process.env
  });

  if (result.error) {
    console.error('\n[openclawid] Failed to run molthub entry:', result.error.message);
    console.error('[openclawid] Ensure molthub is installed as a dependency of openclawid (it should be).');
    process.exit(1);
  }

  process.exit(result.status ?? 0);
}

main();
