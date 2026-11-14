// "Why this portfolio": the project reviews itself. Shown as a tab in the run log.
export const ABOUT_HTML = `
<p><strong>The idea.</strong> A resume is a list; a career is a story with turning points. So each college year is a world,
each turning point is a block you have to reach, and the honest failures are hidden blocks. The game is the narrative device;
the content is still a resume, and the text version is one keypress away for anyone who does not want to play.</p>

<p><strong>Decisions, and why.</strong></p>
<ul class="plain">
  <li><b>Canvas for the scene, DOM for the UI.</b> Hundreds of moving sprites belong on one canvas; text, buttons and dialogs belong
      in the DOM where accessibility and copy-paste are free. The two never share state directly, they talk through a small game controller.</li>
  <li><b>Pure geometry.</b> Positions of every block, pit, platform and coin are computed from the data in a module with no DOM access,
      so the level design is unit-tested: pits never sit under blocks, a standing jump always reaches a block, a running jump clears a pit.</li>
  <li><b>Delta-time physics.</b> Movement is scaled by elapsed time so a 144&nbsp;Hz monitor and a throttled phone play the same level.</li>
  <li><b>Synthesized audio.</b> The chiptune is generated with Tone.js at run time. No audio files to license, cache or load; the music library
      is loaded only after Press Start so first paint stays small.</li>
  <li><b>CC0 art.</b> Kenney's public-domain pack, so the project can be published and forked without a licence question.</li>
  <li><b>Content as data, validated at build.</b> One typed file holds every word on the site; the build fails on an empty title or a bad link.</li>
  <li><b>Progressive by default.</b> Works offline after the first visit, installs as an app, self-hosts its fonts, honours reduced motion,
      and degrades to a plain text log on anything without a canvas.</li>
</ul>

<p><strong>What I would do with another month.</strong> Replace the generated level with a hand-authored tilemap, add a real boss per world,
move the GitHub call behind an authenticated edge function, and record a proper demo video.</p>

<p><strong>Where to look.</strong> <code>ARCHITECTURE.md</code> for the module map, <code>docs/adr/</code> for the three decisions above,
<code>test/</code> and <code>e2e/</code> for how it is verified, and <code>?debug</code> on the URL for the frame-time overlay.</p>`;
