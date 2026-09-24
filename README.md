# Preflight prototype

Preflight helps the CFO of Northstar Commerce Group check a major business decision before committing.
It builds a sourced plan, runs clear rule-based checks across Intuit agents and partner apps, and shows the cash impact in one place.
The prototype uses fixed TypeScript data and simulated timing. It makes no network or AI calls.

## Run locally

```bash
npm install
npm run dev
```

## Build and validate the model

```bash
npm run build
npm run check:data
```

## Deploy

Push to `main`. The GitHub Pages workflow builds the Vite app and publishes `dist` with relative asset paths and hash-based routing.
