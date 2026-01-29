# GoFundMe Pro Supporter Merge Prototype

Clickable, high-fidelity prototype of the “Ideal Supporter (Donor) Merge” workflow inside the GoFundMe Pro admin surface.

## Features
- Dashboard notification linking to duplicates queue
- Supporters list with duplicate pill
- Duplicate candidates queue with filters, bulk actions, and review CTA
- Merge review wizard with validation guardrails and dry-run previews
- Supporter detail enhancements for possible duplicates and merge history
- Merge audit history with modal detail
- LocalStorage persistence to keep merges after refresh

## Tech
- React + TypeScript (Vite)
- React Router for navigation
- In-memory mock data with localStorage persistence

## Setup
```bash
npm install
npm run dev
```

## Resetting data
To reset the mock data, clear localStorage for the key `gfm-supporter-merge-data` or refresh and run:
```js
localStorage.removeItem('gfm-supporter-merge-data')
```
