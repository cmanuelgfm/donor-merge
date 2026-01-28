# GoFundMe Pro - Ideal Supporter Merge Prototype

This is a demo-ready React + TypeScript prototype for an “Ideal Supporter (Donor) Merge” workflow inside the GoFundMe Pro admin surface.

## Features
- Dashboard notification for duplicate supporters.
- Supporters list, supporter detail, and duplicates queue.
- Merge wizard with previews, guardrails, and validations.
- Merge history audit log.
- Mock API with localStorage persistence.

## Getting Started

```bash
npm install
npm run dev
```

The app runs locally using Vite. All data is stored in `localStorage`, so refreshes will keep your merge changes.

## Project Structure
- `src/data/seed.ts` – Seed data for supporters, duplicates, and related entities.
- `src/data/mockApi.ts` – Mock API layer with localStorage persistence.
- `src/pages` – Dashboard, supporters list, duplicates queue, merge wizard, and history pages.
- `src/components` – Layout shell with navigation and top header.

## Notes
- This is a prototype. No backend services are required.
- Analytics events are logged to the console and stored in-memory.
