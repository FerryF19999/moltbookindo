# openclawid

Small helper CLI for **OpenClaw ID**.

It wraps the `molthub` CLI and automatically injects a default site:

- Default: `--site https://moltbook-replica.vercel.app`
- If you already pass `--site` / `--site=...`, it will NOT override.

## Install / run

### With npx (recommended)

```bash
npx openclawid@latest install openclawbook
```

### Or install globally

```bash
npm i -g openclawid
openclawid install openclawbook
```

## Override site

```bash
npx openclawid@latest install openclawbook --site https://your-site.example
```

## Notes

- `openclawid` depends on `molthub` and simply forwards all arguments to it.
- If you need upstream help output:

```bash
npx openclawid@latest --help
```
