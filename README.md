# Report Studio

Offline-first personal web app for exploring recurring Excel/PDF report workflows before connecting real company templates.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Dexie.js (IndexedDB)
- ExcelJS & pdf-lib (demo exports today)
- PWA via `vite-plugin-pwa`

## Getting started

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## MVP features

- Dashboard with stats and quick actions
- Employee CRUD (persisted in IndexedDB, seeded with sample data on first launch)
- Campaign report form with employee selector and dynamic items
- Preview step with demo Excel/PDF download
- Sales & Inventory navigation placeholders
- Settings page describing local storage and offline behavior

## Project structure

```
src/
  components/     Shared UI and layout
  pages/          Route screens
  features/       Feature-specific UI (employees)
  database/       Dexie schema, seed helpers
  reports/        ReportDefinition modules per report type
  hooks/          Live queries, toasts
  config/         Navigation metadata
  types/          Shared TypeScript types
  utils/          Download helpers
```

Adding a new report type: create a folder under `src/reports/<id>/` with types, `ReportDefinition`, form + preview routes, and register it in `src/reports/registry.ts` and `src/config/navigation.ts`.

## Offline

After the first load, the service worker caches application assets. Use DevTools → Application → Service Workers or install the PWA to verify offline usage.

## Build

```bash
npm run build
npm run preview
```

Preview the production bundle locally (GitHub Pages base path):

```bash
npm run build && npm run preview:pages
```

## Deployment

Report Studio is a **static frontend only**. All employee and settings data stays in the browser (IndexedDB). No backend, secrets, or database server are required for deployment.

**Development:**

```bash
npm install
npm run dev
```

**Production build:**

```bash
npm run build
```

**GitHub Pages (automated):**

Push to the `main` branch → GitHub Actions builds and deploys → site is published at:

```text
https://<username>.github.io/report-studio/
```

Workflow file: `.github/workflows/deploy.yml`

After the first deploy, enable **GitHub Pages** in the repository settings with source **GitHub Actions** (not a legacy branch).
