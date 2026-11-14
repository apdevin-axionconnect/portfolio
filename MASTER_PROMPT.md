# Master prompt: next round of improvements for the portfolio

Paste everything below the line into a new coding-agent session opened in the `Frontend` folder.

---

You are continuing work on a portfolio website. Your job is to implement the improvements listed under "Work items", strictly test-first. Read this whole brief before touching anything.

## What exists

Three projects in this folder, nested at build time:

- `portfolio-3d`: a 3D room (React Three Fiber, Vite 8, React 19). It is the deployed site. Its `dist/` is what gets hosted.
- `macos-portfolio`: a macOS-style desktop (Vite 5, React 18) with 14 apps. It is built into `portfolio-3d/public/os` and shown in an iframe on the room's monitor.
- `pixel-quest-portfolio`: a platformer game called Dev Quest (TypeScript, Vite 7). It is built into `macos-portfolio/public/game` and runs in an iframe inside the "Dev Quest" app.

The room also has a drawable whiteboard and a phone with an Android-style interface. Each project has a README; `portfolio-3d/README.md` explains the rendering and performance design. Read all three READMEs and the root `README.md` first.

Content for the macOS desktop and the phone comes from one file: `macos-portfolio/src/data/profile.js`. The game has its own content in `pixel-quest-portfolio/src/data.ts`.

## Commands

Run from the `Frontend` folder:

```
npm run install:all   # install the three projects
npm run check         # lint + type check + unit tests + full build + full-stack smoke test
npm run build         # output: portfolio-3d/dist
```

Performance harnesses, run from `portfolio-3d` after a build:

```
npm run perf -- <label>                  # load metrics, software rendering
GL=hw npm run perf -- <label>            # same on the real GPU
npm run preview -- --port 5200           # then, in another terminal:
node perf/timeline.mjs                   # start-up timeline on the real GPU
node perf/interact.mjs <label>           # frame rate while orbiting, gliding, drawing, dragging
npm run perf:compare -- <before> <after>
```

On Windows, always run builds from a path with an upper-case drive letter (`C:\...`). The game's build fails from a lower-case `c:` path.

## How you must work: test-driven, no exceptions

For every work item, in this order:

1. **Write the test first.** Express the acceptance criteria below as an automated test.
2. **Run it and show it failing** for the right reason. Paste the failing output in your progress note. A test that passes before you write the feature is testing nothing; fix the test.
3. **Implement the smallest change** that makes it pass.
4. **Run the new test, then `npm run check`.** Both must pass before you start the next item.
5. **Re-run the performance harness** if the item touches the 3D scene, start-up, or bundle contents, and compare against the budgets below.

Where tests go:

- **Pure logic** (parsers, reducers, formatters, validators): `node --test`, as the game already does. Do not add a test framework for this.
- **Behaviour in the browser**: Playwright. It is installed in `pixel-quest-portfolio`, and `portfolio-3d/perf/smoke.mjs` shows how to load it from there and drive the room, the macOS iframe, and the game iframe. Extend `smoke.mjs` for end-to-end flows, or add focused scripts beside it and wire them into `npm run check`.
- **Accessibility**: the game's e2e suite already uses an axe check. Reuse that approach for new pages.

Rules:

- Never weaken, skip, or delete an existing test to get green. If a test is wrong, say why and fix it properly.
- One work item per commit-sized change. Do not batch several items and test at the end.
- If you cannot make something testable, stop and explain before implementing it.

## Performance budgets (regressions fail the task)

Measured on an Intel integrated GPU with a cold cache. Treat these as limits:

| Metric | Limit | Harness |
|---|---|---|
| Cold-load transfer | 3,400 KB | `perf/measure.mjs` |
| Room ready | 10 s | `perf/timeline.mjs` |
| Longest freeze while loading | 1.5 s | `perf/timeline.mjs` |
| Orbit frame rate | 45 fps | `perf/interact.mjs` |
| Whiteboard drawing frame rate | 50 fps | `perf/interact.mjs` |
| GPU draw calls while idle | 0 | `GL=hw perf/measure.mjs` |

Things that have broken these before, so check them whenever you add to the room:

- Every new material variant in the 3D scene adds shader compile time on first visit.
- Anything that redraws the scene continuously defeats on-demand rendering.
- `backdrop-filter` over the canvas or inside the embedded macOS costs a GPU pass per frame.

## Hard constraints

- Do not change the game's source in `pixel-quest-portfolio/src` except where a work item explicitly says so. Its existing tests (7 unit, 4 end-to-end including a visual baseline) must keep passing unchanged.
- No secret may ship to the browser. Any API key lives on a server.
- Add a dependency only when a few lines of code will not do, and say why.
- Keep all URLs relative. The site must keep working from a subfolder.
- Do not commit, push, or deploy unless asked.

## Ask the user before you start

Collect these in one message, then proceed with whatever does not depend on the answers:

1. Real profile content: name, role, location, links, about text, skills, projects with URLs and screenshots, experience, education, a resume PDF, an avatar image.
2. Which contact service to use for the form (for example Formspree or Resend), and the account details.
3. Where a small server function can run for the assistant proxy (Netlify Functions, Vercel Functions, or none).
4. Whether analytics are wanted, and which provider.
5. Whether the game's content may be edited to share one source with `profile.js`.

## Work items, in priority order

### Group 1: launch blockers

**1.1 Real content.** Replace every placeholder.
- Test: a content validator (extend the game's `scripts/validate-content.ts` pattern to `profile.js`) fails on any of: the string "Your Name", "yourname", "example.com", "[TODO]", an empty required field, or a missing `public/resume.pdf`. Wire it into `npm run check`. The smoke test's resume warning becomes a hard failure.

**1.2 Share preview.** Title, description, canonical URL, Open Graph and Twitter tags, and a 1200x630 preview image on the 3D page and the standalone macOS page.
- Test: a script parses the built `index.html` files and asserts each tag is present and non-empty, and that the image file exists with the right dimensions.

**1.3 No login barrier when embedded.** Inside the room, the macOS desktop goes straight to the desktop. Standalone keeps boot and login.
- Test: in the room, after clicking Monitor, the Dock is visible without typing. Standalone, the login screen still appears.

### Group 2: high impact

**2.1 Fast path for busy visitors.** "Resume" and "Contact" buttons visible in the room without entering any object.
- Test: both are reachable by keyboard from page load, Resume opens the PDF, Contact opens the form from 2.4, and each has an accessible name.

**2.2 Phones.** On small touch screens, start in the macOS desktop (full-screen) with a clear "Enter the 3D room" option, instead of loading the room first.
- Test: at a 390x844 touch viewport the room's model is not requested until the user opts in, and the desktop is usable. At desktop size the room still loads first.

**2.3 Assistant that works for visitors.** ChatGPT and Siri currently need the visitor's own key. Either route them through a server function with a per-visitor rate limit and the owner's key in server config, or, if the user chose "none" in question 3, replace them with scripted answers built from `profile.js`.
- Test (proxy): the function rejects missing or oversized input, enforces the rate limit, never returns the key, and the built client bundle does not contain a key pattern. Test (scripted): given profile data, known questions return the expected answers.

**2.4 Contact form that sends.** Replace the mail-app handoff in Mail and the canned replies in the phone's Messages with a real form.
- Test: with the network call mocked, valid input sends and shows a confirmation, invalid email and empty message are blocked, a server error shows a readable message, and a double submit sends once.

**2.5 Plain HTML profile.** A static page with all profile content as real text, linked from the 3D page and used as the no-JavaScript fallback.
- Test: the built page contains name, role, every project name, and contact details as text, passes the axe check, and is linked from `index.html`.

### Group 3: reliability

**3.1 Continuous integration.** A GitHub Actions workflow that runs `npm run install:all` and `npm run check` on every push and pull request, on Node 24.
- Test: the workflow file validates, and `npm run check` passes locally from a clean clone.

**3.2 Analytics and error reporting**, only if the user asked for them in question 4. Must respect Do Not Track and load after the room is interactive.
- Test: no analytics request is made before the loader finishes, none when Do Not Track is set, and budgets still hold.

**3.3 One content source**, only if approved in question 5. Generate the game's content from `profile.js` at build time.
- Test: the game's existing validator and all its tests pass against the generated data.

**3.4 Cross-browser check.** Run the smoke test in Firefox and WebKit as well.
- Test: the smoke test passes in all three, or each failure is documented with its cause.

### Group 4: polish (only after groups 1 to 3 are green)

**4.1 More of the room is clickable**: books open case studies, the poster opens the story, the desk lamp switches on and off.
- Test: each object has a matching button in the bottom bar for keyboard users, and activating it produces the expected state. Dragging across an object must not count as a click.

**4.2 Whiteboard undo.**
- Test: draw two strokes, undo once, and the saved image equals the image after stroke one. Undo on an empty board does nothing.

**4.3 Day and night.** The window view and light level follow the visitor's local time.
- Test: with the clock mocked to noon and to midnight, the sky texture and light intensity differ as specified, and no extra shader variant is compiled.

**4.4 Baked lighting.** Pre-compute light and shadow in `portfolio-3d/blender/build_room.py` and remove live shadow-casting lights where the bake replaces them.
- Test: budgets hold or improve, `room.glb` stays under 3 MB, and before/after screenshots are attached for the user to approve. This one needs human sign-off on the look.

## Definition of done for each item

- Its test was written first and shown failing, and now passes.
- `npm run check` passes.
- Performance budgets hold, with the comparison table pasted.
- READMEs are updated where behaviour or commands changed.
- You report what you did, what you did not do, and anything you could not verify.

## Reporting

After each group, give a short status: items done, test output, the budget table, open questions. Do not start the next group until the user confirms.
