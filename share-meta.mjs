// Vite plugin shared by portfolio-3d and macos-portfolio: writes the title, description and social-preview tags into
// index.html at build time, from the one content file (macos-portfolio/src/data/profile.js).
// Social networks need absolute URLs, which are only known once the site has an address:
//   SITE_URL=https://your-domain.example npm run build
import { PROFILE } from './macos-portfolio/src/data/profile.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** suffix: appended to the name in the title. pathWhenEmbedded: this page's path under SITE_URL when it is built into the 3D site. */
export function shareMeta({ suffix, description, imageAlt, pathWhenEmbedded = '' }) {
  let pagePath = '';
  return {
    name: 'share-meta',
    configResolved(c) { if (pathWhenEmbedded && /portfolio-3d[\\/]public/.test(c.build.outDir)) pagePath = pathWhenEmbedded; },
    transformIndexHtml(html) {
      const site = process.env.SITE_URL ? process.env.SITE_URL.replace(/\/?$/, '/') + pagePath : '';
      const title = `${PROFILE.name} — ${suffix}`;
      const desc = description(PROFILE);
      const image = site + 'og.png'; // relative until SITE_URL is known; fine for local use, not for social cards
      const tags = [
        `<meta name="description" content="${esc(desc)}" />`,
        site && `<link rel="canonical" href="${esc(site)}" />`,
        `<meta property="og:type" content="website" />`,
        site && `<meta property="og:url" content="${esc(site)}" />`,
        `<meta property="og:title" content="${esc(title)}" />`,
        `<meta property="og:description" content="${esc(desc)}" />`,
        `<meta property="og:image" content="${esc(image)}" />`,
        `<meta property="og:image:width" content="1200" />`,
        `<meta property="og:image:height" content="630" />`,
        `<meta property="og:image:alt" content="${esc(imageAlt)}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${esc(title)}" />`,
        `<meta name="twitter:description" content="${esc(desc)}" />`,
        `<meta name="twitter:image" content="${esc(image)}" />`,
      ].filter(Boolean).map((t) => '    ' + t).join('\n');
      return html
        .replace(/<title>[^<]*<\/title>/i, `<title>${esc(title)}</title>`)
        .replace(/\s*<meta name="description"[^>]*>/i, '') // replaced by the generated one
        .replace('</head>', tags + '\n  </head>');
    },
  };
}
