# macOS Portfolio

A portfolio website that boots into a macOS-style desktop. Every app on the desktop reads from one data file.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/
```

## Make it yours

1. Edit `src/data/profile.js` (name, links, about, skills, projects, experience, education, certs).
2. Drop your resume at `public/resume.pdf` (the Download button in Preview points there).
3. Optional: set `avatar` and project `image` URLs in `profile.js`, or put files in `public/`.

## ChatGPT and Siri

Both call the OpenAI API directly from the browser. Add a key one of two ways:

- Inside the ChatGPT app: sidebar → "API key & model" (stored in this browser's localStorage only).
- Or copy `.env.example` to `.env` and set `VITE_OPENAI_API_KEY`. Note: a key in `.env` is bundled into the public build, so only do that for a private deployment.

Siri answers portfolio questions and opens apps without a key. With a key it also answers anything else.

## Apps

Finder, Safari (start page, project pages, real URLs in an iframe), Notes (editable, saved), Terminal (`help`), Mail (compose opens your mail client), Calculator, Photos, Preview (resume + PDF download), Music (Web Audio), ChatGPT, Siri, System Settings (theme, accent, wallpaper, dock), About This Mac.

## Shortcuts

`Ctrl/⌘ Space` Spotlight · `F4` Launchpad · `Esc` dismiss · window shortcuts use `⌘` on Mac and `Alt` elsewhere (browsers own Ctrl+W): `W` close, `M` minimize, `,` Settings
