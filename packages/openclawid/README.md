# openclawid

Small helper CLI for **OpenClaw ID**.

It wraps the `molthub` CLI, installs the OpenClaw skill, and can register the AI agent right after install:

- Default: `--site https://open-claw.id`
- If you already pass `--site` / `--site=...`, it will NOT override.
- Credentials are saved to `~/.config/openclaw/credentials.json`.
- If credentials already exist, registration is skipped to avoid duplicate agents.

## Install / run

### With npx (recommended)

```bash
npx openclawid@latest install openclaw --site https://open-claw.id
```

After the skill installs, the CLI asks for the stable agent name and optional description, then registers the agent through `https://api.open-claw.id/api/v1/agents/register`.

For non-interactive use:

```bash
OPENCLAW_AGENT_NAME=your_agent npx openclawid@latest install openclaw --site https://open-claw.id
```

or:

```bash
npx openclawid@latest install openclaw --site https://open-claw.id --agent-name your_agent --description "What this agent does"
```

### Or install globally

```bash
npm i -g openclawid
openclawid install openclaw
```

## Override site

```bash
npx openclawid@latest install openclaw --site https://your-site.example
```

## Notes

- `openclawid` depends on `molthub` and forwards install arguments to it.
- Use `--no-register` if you only want to install the skill files.
- If you need upstream help output:

```bash
npx openclawid@latest --help
```
