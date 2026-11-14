// Work item 1.2: links to the site must unfurl properly (title, description, image) on LinkedIn, WhatsApp, X, Slack.
// Reads the built pages, so run after `npm run build`.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { root } from './helpers.mjs';

const dist = path.join(root, 'dist');
const pages = { '3D room': 'index.html', 'macOS desktop': 'os/index.html' };
const meta = (html, attr, name) => html.match(new RegExp(`<meta[^>]*${attr}="${name}"[^>]*content="([^"]*)"`, 'i'))?.[1] ?? html.match(new RegExp(`<meta[^>]*content="([^"]*)"[^>]*${attr}="${name}"`, 'i'))?.[1];

for (const [label, file] of Object.entries(pages)) {
  const html = fs.readFileSync(path.join(dist, file), 'utf8');
  const dir = path.dirname(path.join(dist, file));

  test(`${label}: has a real title and description`, () => {
    const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? '';
    assert.ok(title.trim().length >= 10, `title too short: "${title}"`);
    assert.ok(!/^(portfolio|3d portfolio)$/i.test(title.trim()), `generic title: "${title}"`);
    assert.ok((meta(html, 'name', 'description') ?? '').length >= 50, 'meta description missing or too short');
  });

  test(`${label}: has Open Graph and Twitter tags`, () => {
    for (const p of ['og:title', 'og:description', 'og:type', 'og:image', 'og:image:width', 'og:image:height', 'og:image:alt']) assert.ok(meta(html, 'property', p)?.trim(), `${p} missing or empty`);
    for (const n of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) assert.ok(meta(html, 'name', n)?.trim(), `${n} missing or empty`);
    assert.equal(meta(html, 'name', 'twitter:card'), 'summary_large_image');
  });

  test(`${label}: the preview image exists and is 1200x630`, () => {
    const src = meta(html, 'property', 'og:image');
    const file = path.join(dir, new URL(src, 'http://x/').pathname.split('/').pop());
    assert.ok(fs.existsSync(file), `preview image not found in the build: ${src}`);
    const b = fs.readFileSync(file);
    assert.equal(b.toString('ascii', 1, 4), 'PNG');
    assert.deepEqual([b.readUInt32BE(16), b.readUInt32BE(20)], [1200, 630]); // PNG IHDR width, height
    assert.equal(meta(html, 'property', 'og:image:width'), '1200');
    assert.equal(meta(html, 'property', 'og:image:height'), '630');
  });

  // Social networks need absolute URLs. They are only known once the site has an address: build with SITE_URL=https://...
  test(`${label}: canonical and absolute URLs when SITE_URL is set`, { skip: !process.env.SITE_URL && 'SITE_URL not set for this build' }, () => {
    const site = process.env.SITE_URL.replace(/\/?$/, '/');
    assert.ok(html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i)?.[1]?.startsWith(site), 'canonical link missing');
    assert.ok(meta(html, 'property', 'og:url')?.startsWith(site), 'og:url missing');
    assert.ok(meta(html, 'property', 'og:image').startsWith(site), 'og:image must be absolute');
  });
}
