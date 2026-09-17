# Campus IQ

The student platform for Kamulu University — one calm place for your timetable, events, dining, shuttles, the campus map and an assistant that always knows.

## Pages

| Page | What it does |
| --- | --- |
| `index.html` | Home — live announcements ticker, services, this week, student quotes |
| `assistant.html` | **IQ Assistant** — a working demo chat with a campus knowledge engine (deadlines, directions, dining, shuttles, Wi-Fi, health…) |
| `events.html` | Events with category filters, live deadline countdowns, one-tap **.ics calendar export** |
| `academics.html` | Interactive weekly timetable (Mon–Fri tabs) + animated Spring 2026 grade breakdown |
| `campus.html` | Hand-drawn **interactive SVG campus map** (8 tappable buildings), facilities, full dining menu with filters, shuttle schedule |
| `community.html` | 12 of 38 clubs with filters + working join buttons, official notice board, club pitch form |
| `about.html` | Story, values, 2019→2026 timeline, team |
| `contact.html` | Contact details + validated form with a success state |

## Highlights

- **Earthy design system** — cream / ink / moss green / clay / warm grey tokens in `css/styles.css` (`:root`), all colour decisions live in one block.
- **⌘K / Ctrl+K command palette** on every page for instant navigation.
- No build step, no dependencies — plain HTML/CSS/JS.

## Run it

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Structure

```
css/styles.css    design system + all components
js/main.js        nav, reveals, palette, toasts, ICS export, page modules
js/assistant.js   IQ chat knowledge engine
assets/img/       generated campus imagery
```
