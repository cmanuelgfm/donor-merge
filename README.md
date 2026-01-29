# GoFundMe Pro – Ideal Supporter Merge Prototype

This is a high-fidelity prototype of the “Ideal Supporter (Donor) Merge” workflow inside the GoFundMe Pro admin surface.

## Setup

```bash
npm install
npm run dev
```

## What’s included

- React + TypeScript app (Vite)
- React Router navigation with GoFundMe Pro styled shell
- In-memory mock data persisted to localStorage
- Merge queue, merge wizard, and merge audit history
- Analytics instrumentation stubs (console + in-memory)

## Key routes

- `/dashboard` – admin dashboard with duplicate notification card
- `/supporters` – supporters list (includes “Duplicates” pill)
- `/supporters/duplicates` – duplicates queue
- `/supporters/merge/:candidateId` – merge wizard
- `/supporters/merge-history` – merge audit history
- `/supporters/:id` – supporter detail

## Resetting the data

Delete localStorage key `gfp-merge-prototype-data` in the browser to restore seed data.
