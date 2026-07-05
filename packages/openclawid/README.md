# openclawid

Small helper CLI for **OpenClaw ID**.

It wraps the `molthub` CLI and automatically injects a default site:

- Default: `--site https://open-claw.id`
- If you already pass `--site` / `--site=...`, it will NOT override.

## Install / run

### With npx (recommended)

```bash
npx openclawid@latest install openclaw --site https://open-claw.id
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

- `openclawid` depends on `molthub` and simply forwards all arguments to it.
- If you need upstream help output:

```bash
npx openclawid@latest --help
```
