# Kay To-Do

A simple personal productivity dashboard: a to-do list, notes and a focus timer.
It runs entirely in your browser. There's no account and no server, and your data
is saved in the browser's local storage.

## Features

- **Dashboard**: today's tasks, remaining/completed counts, a compact timer, recent notes and a quick "Add task" button.
- **Tasks**: add, edit, delete (with undo), complete/uncomplete. Optional description, due date and priority. Filters: All, Today, Upcoming, Completed. Reorder by drag-and-drop or with the ↑/↓ buttons.
- **Notes**: create, edit and delete notes (with undo). They save automatically as you type. Search by title or text.
- **Timer**: 5/15/25/45/60-minute presets or a custom length (1–240 min). Start, pause, resume and reset. You can link it to a task. When time is up you get a banner, a chime and a tab-title alert, plus an optional desktop notification.

## Tech stack

- **React**: builds the user interface out of small, reusable pieces called "components".
- **TypeScript**: JavaScript with types, which catches many mistakes before the app runs.
- **Vite**: the development server and build tool. It reloads the page instantly when you save a file.
- **Plain CSS** with shared design tokens (CSS variables) in `src/styles/base.css`.

There are no other runtime libraries. Navigation, drag-and-drop, storage and the timer use built-in browser features.

## Getting started

You need [Node.js](https://nodejs.org/) (version 20 or newer) installed.

```bash
npm install     # download the libraries this project uses (only needed once, or after they change)
npm run dev     # start the app locally, then open http://localhost:5173
```

## Other commands

```bash
npm run build   # check the code for type errors and create an optimized version in the dist/ folder
npm run lint    # check the code for common mistakes
npm run preview # serve the optimized build from dist/ to try it locally
```

## Project structure

```
src/
  main.tsx               Starts the app
  App.tsx                Top-level component: holds tasks, notes and timer state; picks the page
  types.ts               Shapes of the saved data (Task, Note)
  data/                  "Repositories": create, validate, filter and store tasks and notes
    tasks.ts
    notes.ts
  lib/                   Small helpers with no React in them
    storage.ts           Safe localStorage reading/writing (versioned, handles damaged data)
    dates.ts             Due-date and time formatting
    notify.ts            Chime and browser notifications
    id.ts                Unique ids
  hooks/                 Reusable React logic
    useTasks.ts          Task actions (add, edit, complete, delete, reorder)
    useNotes.ts          Note actions and the currently open note
    useTimer.ts          Accurate countdown timer
    usePersistedList.ts  Keeps a list in sync with localStorage (and across tabs)
    useHashRoute.ts      Tiny router using the URL after the # sign
    useToday.ts          Today's date, updated at midnight
  pages/                 One component per screen: Dashboard, Tasks, Notes, Timer
  components/            Building blocks used by the pages
    layout/  tasks/  notes/  timer/  ui/
  styles/                CSS: base (tokens and shared styles), plus one file per area
```

## How data is stored

Everything is saved in your browser's `localStorage` under keys starting with `kay-todo:`:

| Key               | Contents                                                           |
| ----------------- | ------------------------------------------------------------------ |
| `kay-todo:tasks`  | `{ "version": 1, "items": [Task, ...] }`. The array order is your manual order. |
| `kay-todo:notes`  | `{ "version": 1, "items": [Note, ...] }`                           |
| `kay-todo:timer`  | Timer length, linked task and the countdown in progress            |

If saved data is ever damaged, the app loads what it can, shows a message, and keeps a copy
of the original under `<key>:backup`.

Data stays in *this* browser on *this* device. Clearing your browser's site data deletes it.

### Moving to a real backend later

All saving and loading goes through `src/data/tasks.ts` and `src/data/notes.ts`, which use
`src/lib/storage.ts`. To add a server or cloud database, you'd replace those functions with
API calls. The records already have ids and `createdAt`/`updatedAt` timestamps, which makes
syncing easier.

## Manual testing checklist

1. Add a task (try submitting an empty one: you should see an error).
2. Edit it (pencil icon), then press Escape to cancel an edit.
3. Tick it complete, then untick it.
4. Delete it, then click **Undo** in the message at the bottom.
5. Reorder tasks by dragging (desktop) and with the ↑/↓ buttons.
6. Refresh the page: tasks and their order are still there.
7. Close the browser and reopen the app: everything is still there.
8. Create, edit, search and delete notes.
9. Start the timer, pause, resume, reset. Set a 1-minute custom timer and let it reach zero.
10. Make the browser window narrow (or use your phone) to check the mobile layout.
