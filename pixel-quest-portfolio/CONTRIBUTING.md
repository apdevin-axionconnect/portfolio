# Contributing

This is a one-person portfolio, but it is run like a team project.

- **Branches:** `main` is deployable at all times. Work on `feat/*`, `fix/*`, `docs/*`.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`). One concern per commit.
- **Before a PR:** `npm run typecheck && npm test && npm run e2e`. CI runs the same plus Lighthouse budgets.
- **Content changes** go only in `src/data.ts`; the build validates them.
- **Design changes** go through `src/tokens.css` first; check `styleguide.html`.
- **Decisions** that change architecture get an ADR in `docs/adr/`.
- **Changelog:** add a line under *Unreleased* in `CHANGELOG.md`.
