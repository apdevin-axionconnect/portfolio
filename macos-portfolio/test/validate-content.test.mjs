// Work item 1.1: the site must not launch with placeholder content.
import test from 'node:test';
import assert from 'node:assert/strict';
import { findProblems } from '../scripts/validate-content.mjs';

const good = () => ({
  PROFILE: {
    name: 'Asha Rao', handle: 'asharao', role: 'Frontend Developer', tagline: 'I build fast interfaces.', location: 'Pune, India',
    email: 'asha@asharao.dev', phone: '+91 98765 43210', about: 'I build things for the web.',
    links: { github: 'https://github.com/asharao', linkedin: 'https://linkedin.com/in/asharao', twitter: 'https://x.com/asharao', website: 'https://asharao.dev' },
  },
  SKILLS: [{ group: 'Languages', items: ['TypeScript'] }],
  PROJECTS: [{ slug: 'planner', name: 'Planner', year: 2025, tagline: 'A planner.', description: 'Plans things.', tech: ['React'], url: 'https://planner.asharao.dev', repo: 'https://github.com/asharao/planner', highlights: ['Used daily'] }],
  EXPERIENCE: [{ company: 'Acme', role: 'Intern', period: '2024', location: 'Remote', bullets: ['Shipped a thing.'] }],
  EDUCATION: [{ school: 'Pune University', degree: 'B.Tech CSE', period: '2022 - 2026', note: 'CGPA 8.7' }],
});
const check = (data, resumeExists = true) => findProblems(data, { resumeExists });

test('real content with a resume has no problems', () => assert.deepEqual(check(good()), []));

test('the template name is rejected', () => { const d = good(); d.PROFILE.name = 'Your Name'; assert.match(check(d).join('\n'), /PROFILE\.name.*Your Name/); });
test('the template handle is rejected wherever it appears', () => { const d = good(); d.PROFILE.links.github = 'https://github.com/yourname'; assert.match(check(d).join('\n'), /PROFILE\.links\.github.*yourname/); });
test('example.com addresses are rejected', () => { const d = good(); d.PROJECTS[0].url = 'https://example.com'; assert.match(check(d).join('\n'), /PROJECTS\[0\]\.url.*example\.com/); });
test('[TODO] markers are rejected', () => { const d = good(); d.EXPERIENCE[0].bullets[0] = '[TODO] write this'; assert.match(check(d).join('\n'), /EXPERIENCE\[0\]\.bullets\[0\].*\[TODO\]/); });
test('an empty required field is rejected', () => { const d = good(); d.PROFILE.email = '  '; assert.match(check(d).join('\n'), /PROFILE\.email is empty/); });
test('a missing required field is rejected', () => { const d = good(); delete d.PROFILE.role; assert.match(check(d).join('\n'), /PROFILE\.role is empty/); });
test('empty lists are rejected', () => { const d = good(); d.PROJECTS = []; assert.match(check(d).join('\n'), /PROJECTS is empty/); });
test('a missing resume PDF is rejected', () => assert.match(check(good(), false).join('\n'), /resume\.pdf/));
test('optional fields may stay empty', () => { const d = good(); d.PROFILE.avatar = ''; d.PROJECTS[0].image = ''; assert.deepEqual(check(d), []); });
test('every problem is reported, not just the first', () => { const d = good(); d.PROFILE.name = 'Your Name'; d.PROFILE.email = 'you@example.com'; assert.equal(check(d, false).length, 3); });
