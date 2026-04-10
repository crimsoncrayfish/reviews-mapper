# AGENTS.md

Project context and working conventions for coding agents operating in this repository.

## Project Overview

- App: Review Coordination Tool (interactive peer-review assignment matrix)
- Stack: React + Vite + Zustand + Tailwind CSS + dnd-kit + xlsx
- Deployment target: GitHub Pages (`homepage` points to `/reviews-mapper`)
- Live URL: `https://crimsoncrayfish.github.io/reviews-mapper`
- Persistence: Browser `localStorage` (key: `crayfish-mappings`)

## Primary Workflows

- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Preview build: `npm run preview`
- Deploy: `npm run deploy`

## Runtime Behavior

- Two URL-backed pages:
  - `?page=people` for people management
  - `?page=matrix` for the matrix view
- Legacy path links (`/mapping`, `/matrix`) are still parsed for backward compatibility.
- Routing is implemented in `src/App.jsx` via `window.history.pushState` + `popstate`.
- In matrix compact mode, major UI chrome is hidden for maximum grid space.

## State Model (Zustand)

Defined in `src/store.js`:

- `people`: array of person objects `{ id, name, title, project, order, flagged }`
- `relationships`: directed edges `{ reviewerId, revieweeId }`
- `toasts`: temporary notifications
- `compactMode`: matrix density mode toggle

Important behavior:

- Self-reviews are implicit and never stored as relationships.
- Adding people can auto-create mutual relationships for members of the same project.
- Most mutating actions persist to `localStorage` immediately.

## Key Files

- `src/App.jsx`: top-level page state, export handlers, layout shell
- `src/store.js`: canonical app state and all mutation actions
- `src/components/NameManager.jsx`: people import/edit management
- `src/components/ReviewGrid.jsx`: matrix rendering, interactions, dnd behavior
- `src/components/Navigation.jsx`: page switch + export actions
- `src/components/Toast.jsx`, `src/components/ToastContainer.jsx`: notifications

## Agent Conventions

- Follow existing coding style (double quotes, semicolons, functional React patterns).
- Keep data-shape changes coordinated across UI, store actions, and export logic.
- Preserve GitHub Pages path behavior (`import.meta.env.BASE_URL`) when editing navigation/routing.
- Avoid introducing new persistence keys unless there is a migration plan.
- Prefer small, focused edits over broad refactors.

## Validation Checklist

After meaningful UI or state changes:

1. Run `npm run lint`.
2. Run `npm run build`.
3. Manually verify both `?page=people` and `?page=matrix` flows in dev server.
4. Verify persisted data survives refresh.

## Known Notes

- README may mention React 18; current dependencies are React 19.
- The app has deliberate dense/compact matrix behavior; keep performance and readability balanced for larger teams.
