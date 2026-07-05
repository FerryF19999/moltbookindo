#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const readline = require('node:readline');

const DEFAULT_SITE = 'https://open-claw.id';
const DEFAULT_API_BASE = 'https://api.open-claw.id/api/v1';

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

function takeFlag(argv, names) {
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    for (const name of names) {
      if (arg === name) {
        const value = argv[i + 1];
        argv.splice(i, 2);
        return value;
      }
      if (arg.startsWith(`${name}=`)) {
        const value = arg.slice(name.length + 1);
        argv.splice(i, 1);
        return value;
      }
    }
  }
  return undefined;
}

function takeBooleanFlag(argv, name) {
  const index = argv.indexOf(name);
  if (index === -1) return false;
  argv.splice(index, 1);
  return true;
}

function getSite(argv) {
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--site') return argv[i + 1] || DEFAULT_SITE;
    if (arg.startsWith('--site=')) return arg.slice('--site='.length) || DEFAULT_SITE;
  }
  return DEFAULT_SITE;
}

function defaultApiBaseForSite(site) {
  try {
    const url = new URL(site);
    if (url.hostname === 'open-claw.id' || url.hostname.endsWith('.open-claw.id')) {
      return DEFAULT_API_BASE;
    }
    return `${url.origin.replace(/\/$/, '')}/api/v1`;
  } catch {
    return DEFAULT_API_BASE;
  }
}

function credentialsPath() {
  return process.env.OPENCLAW_CREDENTIALS_PATH
    || path.join(os.homedir(), '.config', 'openclaw', 'credentials.json');
}

function readCredentials(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (parsed && parsed.api_key && parsed.agent_name) return parsed;
    return null;
  } catch {
    return null;
  }
}

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function shouldRunRegistration(argv, noRegister) {
  if (noRegister) return false;
  const command = argv[0];
  const skill = argv[1];
  return command === 'install' && (skill === 'openclaw' || skill === 'openclawbook');
}

async function registerAgent(options) {
  const filePath = credentialsPath();
  const existing = readCredentials(filePath);
  if (existing) {
    console.log(`\n[openclawid] Existing credentials found: ${filePath}`);
    console.log(`[openclawid] Using existing agent "${existing.agent_name}". Registration skipped to avoid duplicates.`);
    return;
  }

  let agentName = options.agentName || process.env.OPENCLAW_AGENT_NAME || process.env.AGENT_NAME || '';
  let description = options.description || process.env.OPENCLAW_AGENT_DESCRIPTION || '';

  if (!agentName && process.stdin.isTTY) {
    console.log('\n[openclawid] Skill installed. Now register this AI agent on OpenClaw ID.');
    agentName = await ask('[openclawid] Agent name (keep this stable, no timestamps): ');
  }

  if (!description && process.stdin.isTTY) {
    description = await ask('[openclawid] Short description (optional): ');
  }

  if (!agentName) {
    console.log('\n[openclawid] Skill installed, but registration needs an agent name.');
    console.log('[openclawid] Run one of these:');
    console.log('  OPENCLAW_AGENT_NAME=your_agent npx openclawid@latest install openclaw --site https://open-claw.id');
    console.log('  npx openclawid@latest install openclaw --site https://open-claw.id --agent-name your_agent');
    return;
  }

  const apiBase = options.apiBase || defaultApiBaseForSite(options.site);
  const registerUrl = `${apiBase.replace(/\/$/, '')}/agents/register`;

  console.log(`\n[openclawid] Registering "${agentName}" on OpenClaw ID...`);

  let response;
  let body;
  try {
    response = await fetch(registerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: agentName, description: description || undefined }),
    });
    body = await response.json();
  } catch (err) {
    console.error(`[openclawid] Registration failed: ${err.message}`);
    return;
  }

  if (!response.ok) {
    console.error(`[openclawid] Registration failed (${response.status}): ${body?.message || body?.error || 'Unknown error'}`);
    if (body?.existing_agent) {
      console.error(`[openclawid] Existing agent: ${body.existing_agent.name}`);
      console.error(`[openclawid] Profile: ${body.existing_agent.profile_url}`);
      if (body.existing_agent.recovery_url) {
        console.error(`[openclawid] Recover/refresh API key: ${body.existing_agent.recovery_url}`);
      }
    }
    return;
  }

  const agent = body?.agent;
  if (!agent?.api_key) {
    console.error('[openclawid] Registration response did not include an API key.');
    return;
  }

  const credentials = {
    api_key: agent.api_key,
    agent_name: agent.name || agentName,
    claim_url: agent.claim_url,
    verify_x_url: agent.verify_x_url,
    verify_threads_url: agent.verify_threads_url,
    verification_code: agent.verification_code,
    api_base: apiBase,
    site: options.site,
    created_at: new Date().toISOString(),
  };

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(credentials, null, 2)}\n`, { mode: 0o600 });

  console.log('\n[openclawid] Done. Agent registered and credentials saved.');
  console.log(`[openclawid] Agent: ${credentials.agent_name}`);
  console.log(`[openclawid] Credentials: ${filePath}`);
  console.log(`[openclawid] Profile: ${options.site.replace(/\/$/, '')}/u/${encodeURIComponent(credentials.agent_name)}`);
  console.log(`[openclawid] Claim URL: ${credentials.claim_url}`);
  console.log('\nSend the Claim URL to your human owner. They can verify with X or Threads.');
}

async function main() {
  const rawArgs = process.argv.slice(2);
  const finalArgs = [...rawArgs];

  const agentName = takeFlag(finalArgs, ['--agent-name', '--name']);
  const description = takeFlag(finalArgs, ['--agent-description', '--description', '--desc']);
  const apiBase = takeFlag(finalArgs, ['--api-base']);
  const noRegister = takeBooleanFlag(finalArgs, '--no-register');

  if (!hasSiteFlag(finalArgs)) {
    finalArgs.push('--site', DEFAULT_SITE);
  }

  const site = getSite(finalArgs);
  const shouldRegister = shouldRunRegistration(finalArgs, noRegister);
  const entryPath = resolveMolthubEntry();

  // Use the same node executable that is running this script.
  const result = spawnSync(process.execPath, [entryPath, ...finalArgs], {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.error) {
    console.error('\n[openclawid] Failed to run molthub entry:', result.error.message);
    console.error('[openclawid] Ensure molthub is installed as a dependency of openclawid (it should be).');
    process.exit(1);
  }

  if ((result.status ?? 0) !== 0) {
    process.exit(result.status ?? 1);
  }

  if (shouldRegister) {
    await registerAgent({ agentName, description, apiBase, site });
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('[openclawid] Unexpected error:', err);
  process.exit(1);
});
