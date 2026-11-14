# Changelog

## Unreleased
- Story model: every card has `why` and `lesson`; worlds have a `theme`, an honest-failure `secret` and a `signpost` quote; finale has `next`.
- Level-up moment (badge pose + sparkle) on entering a new world; signposts in the world open quote cards.
- Run log tabs: Story (keyboard "text play"), Skill tree, Why this portfolio.
- Design tokens (`tokens.css`), dark theme driven by the day-night cycle, `styleguide.html`.
- `physics.ts` extracted and unit-tested (reachability, pit clearance, frame-rate independence).
- Build-time content validation, GitHub API 24 h cache with offline state, feature flags, `?debug` overlay, crash fallback.
- Lazy-loaded audio; reduced motion disables shake, iris and weather.
- Playwright: axe accessibility scan and screenshot regression. Lighthouse CI budgets. Dependabot.
- ARCHITECTURE.md, three ADRs, CONTRIBUTING.md.

## 1.0.0
- HD platformer portfolio: four worlds, ? blocks, coins, pits, platforms, critters, secrets, timer, save/resume, share card, PWA.
