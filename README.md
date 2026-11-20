# Launch Console 🚀

**Launch Console** is a lightweight launch-planning dashboard for early-stage founders.
It turns "we should launch soon" into a concrete checklist so small teams can see
exactly what's left before go-live.

## Problem
First-time founders juggle product, marketing, legal and ops tasks across sticky notes,
group chats and docs. Things slip, and nobody knows how close the team actually is to launch.

## Solution
One page that tracks every launch task, shows a live readiness score, and lets the team
filter by area (Product, Marketing, Legal, Ops).

## Features
- Add, complete, rename (double-click) and delete launch tasks
- Tag tasks by area: Product, Marketing, Legal, Ops, and filter by tag
- Due dates, with overdue and due-today highlighting; unfinished and soonest tasks sort to the top
- Launch readiness score plus a progress breakdown for each area
- Set a target launch date and see a live countdown
- Load a starter checklist of 10 common launch tasks in one click

## Tech stack
- HTML, CSS, vanilla JavaScript (no build step)
- `localStorage` for persistence (MVP; a backend is on the roadmap)

## Run it locally
1. Clone the repo: `git clone https://github.com/ac2300/launch-console.git`
2. Open `index.html` in your browser. That's it.

## Roadmap
- [x] Project setup
- [x] Add / complete / delete launch tasks
- [x] Launch readiness progress bar
- [x] Category tags + filtering
- [x] Due dates with overdue highlighting and smart sorting
- [x] One-click launch template, inline rename, clear completed
- [x] Target launch date countdown + per-category progress
- [ ] Reminders / notifications
- [ ] Team accounts and shared boards (backend)

## Contributing
Work happens on feature branches and is merged through pull requests.
See `CONTRIBUTING.md` and `PULL_REQUEST_TEMPLATE.md`.
