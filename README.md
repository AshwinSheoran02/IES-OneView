# OneView prototype

OneView gives the CFO of Northstar Commerce Group one place to see August performance, the changes that matter, and the connected-app evidence behind each explanation.
The prototype includes four metric details, source-backed Intuit AI explanations, expert review, transaction evidence, and connected-app management.
It is a frontend-only, fixed-data scenario built for laptop evaluation inside the Intuit Enterprise Suite shell.

## Run locally

```bash
npm install
npm run dev
```

## Build and validate data

```bash
npm run build
npm run check:data
```

## Deploy to Vercel

1. Import the GitHub repository in Vercel.
2. Choose the **Vite** framework preset.
3. Set the build command to `npm run build`.
4. Set the output directory to `dist`.
5. Deploy. Hash routing is used, so no rewrite rules are needed.
