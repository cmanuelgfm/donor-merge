# GoFundMe Pro Supporter Merge Prototype

A high-fidelity, clickable prototype for the “Ideal Supporter (Donor) Merge” workflow inside the GoFundMe Pro admin surface.

## Features
- Duplicate supporter queue with filters, bulk actions, and merge review.
- Multi-step merge wizard with guardrails, dry-run preview, and audit history.
- Supporter detail enhancements showing possible duplicates and merge history.
- Local mock API with localStorage persistence so merges persist after refresh.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 to view the prototype.

## Notes
- Data is persisted in `localStorage` under `gfpro-merge-prototype`.
- To reset the demo data, clear localStorage in your browser.
