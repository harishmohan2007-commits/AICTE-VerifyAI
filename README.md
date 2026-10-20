# AICTE VerifyAI

AICTE VerifyAI is a frontend application for institutional application review, document verification, compliance checks, infrastructure evidence review, reporting, and audit tracking.

## Requirements

- Node.js 20.19+ (Node.js 22 recommended)
- pnpm 10+

## Run locally

```bash
pnpm install --frozen-lockfile
pnpm dev
```

## Production build

```bash
pnpm run build
pnpm preview
```

The production build output is generated in `dist/`.

## Deploy to Vercel

- Framework preset: Vite
- Build command: `pnpm run build`
- Output directory: `dist`
- Install command: `pnpm install --frozen-lockfile`

No design-tool configuration is required for the production build.
