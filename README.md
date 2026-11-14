# Portfolio

Three projects, nested at build time:

`portfolio-3d` (3D room) shows `macos-portfolio` (macOS-style desktop) on its monitor, which runs `pixel-quest-portfolio` (Dev Quest game) as an app.

```
npm run install:all   # install the three projects
npm run check         # lint + type check + unit tests + build + full-stack smoke test
npm run build         # output: portfolio-3d/dist (fully static, relative URLs)
npm run validate      # launch gate: fails while profile.js has placeholder content or resume.pdf is missing
npm run check:launch  # validate + check. Use this one before deploying.
```

Tests: `npm test` runs the unit tests (game physics, content validator). `npm run e2e` runs the browser tests in
`portfolio-3d/tests` against the production build (embedded login, share-preview tags).

Social preview: titles, descriptions and Open Graph tags are written at build time by `share-meta.mjs` from `profile.js`.
Networks need absolute URLs, so build with your address once you have one: `SITE_URL=https://your-domain npm run build`.
After changing content, regenerate the preview images: `npm run build`, then `npm run og --prefix portfolio-3d`, then build again.

Deploy `portfolio-3d/dist` to any static host. `netlify.toml` and `vercel.json` are ready; Node 24+ is required to build.
On Windows, run from a path with an upper-case drive letter (`C:\...`).

## Deploy checklist

1. `npm run check:launch` passes (content gate, lint, type check, unit tests, build, smoke test, browser tests).
2. Push this folder to a Git repository. Set `SITE_URL` to the final address in the host's build environment.
3. Netlify: "Import from Git", no settings needed (`netlify.toml`). Vercel: same (`vercel.json`). Any other static host: run
   `npm run install:all && npm run build` and upload `portfolio-3d/dist`.
4. Open the deployed URL once and click Monitor, Whiteboard and Phone.

Before going live: fill in `macos-portfolio/src/data/profile.js` and the game's `src/data.ts`, and add `macos-portfolio/public/resume.pdf`.
