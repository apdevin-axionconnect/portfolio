import type { Profile, Level, Finale } from './types';
// ============================================================================
//  THIS IS THE ONLY FILE YOU NEED TO EDIT. Every [TODO] below is placeholder copy.
//  Rules for a card: `text` = what happened, `why` = why it mattered, `lesson` = what you would do differently.
//  Each world is a turning point, not a syllabus. Secrets are honest failures. Signposts are real quotes.
//  `npm run build` validates this file and fails on empty titles, bad links or missing worlds.
// ============================================================================

export const PROFILE: Profile = {
  name: 'YOUR NAME',
  tagline: 'Frontend developer · B.Tech CSE · Class of 2026',
  github: 'torvalds', // GitHub username for live stats on the finale card; set to '' to disable
  repo: 'https://github.com/yourname/dev-quest-portfolio', // this project's repository, linked from the title screen
};

export const LEVELS: Level[] = [
  { year: '2022', title: 'FIRST YEAR', theme: 'Curiosity',
    secret: '[TODO honest failure] I failed my first coding assignment because I copied code I did not understand. I rewrote it from scratch the next weekend.',
    signpost: { quote: '[TODO real quote] "Asks why until the answer is a mechanism, not a name."', by: 'Prof. A. Mentor, Programming 101' },
    items: [
      { type: 'skill', title: 'Recursion finally clicked', text: '[TODO] A recursive factorial blew the stack and I spent a night finding out what a stack frame is.', why: 'It was the first time I understood how the machine runs my code, not just what the code says.', lesson: 'Draw the call tree before writing the function.', details: { level: 4, tech: ['C', 'Python', 'GDB'] } },
      { type: 'skill', title: 'A page a stranger could read', text: '[TODO] Built a static site for a college club; centered a div on the third try.', why: 'First feedback from a real reader: the navigation confused them. Design is for them, not me.', lesson: 'Test with one real person before polishing.', details: { level: 5, tech: ['HTML5', 'CSS3', 'Flexbox'] } },
      { type: 'contest', title: '24-hour hackathon, no sleep, no prize', text: '[TODO] Team of three, a to-do app, a demo that crashed on stage.', why: 'Learned that a working demo beats a feature list every single time.', lesson: 'Freeze scope at hour 12 and rehearse the demo.', details: { tech: ['JavaScript', 'LocalStorage'] } },
    ]},
  { year: '2023', title: 'SECOND YEAR', theme: 'Craft',
    secret: '[TODO honest failure] I abandoned a chat-app side project after two months because I built the login before the chat. Start with the core loop.',
    signpost: { quote: '[TODO real quote] "Ships small, ships often, and writes the commit message you wish everyone wrote."', by: 'Teammate, Weather App' },
    items: [
      { type: 'skill', title: '150 problems and a pattern library', text: '[TODO] Arrays, trees, graphs; kept a notebook of patterns instead of solutions.', why: 'Interview questions stopped being puzzles and became recognisable shapes.', lesson: 'Review the notebook weekly; solving once is forgetting.', details: { level: 4, tech: ['JavaScript', 'Algorithms'], links: [{ label: 'LeetCode', href: 'https://leetcode.com/' }] } },
      { type: 'cert', title: 'Responsive Web Design', text: '[TODO] freeCodeCamp certification, 300 hours.', why: 'The certificate mattered less than finally understanding the cascade.', lesson: 'Build one real layout per module instead of only the exercises.', details: { links: [{ label: 'View certificate', href: 'https://freecodecamp.org/' }] } },
      { type: 'contest', title: 'CodeChef 3-star', text: '[TODO] Reached 3 stars; first time the clock felt like an enemy.', why: 'Speed under pressure is a skill, not a talent.', lesson: 'Read every problem before solving any.' },
      { type: 'project', title: 'Weather app that survived a 429', text: '[TODO] First project with a real API; the free tier rate-limited me during a demo.', why: 'Learned caching, error states and that the network is not reliable.', lesson: 'Design the error state before the happy path.', details: { tech: ['Fetch API', 'OpenWeather', 'CSS Grid'], image: '', links: [{ label: 'Live demo', href: '#' }, { label: 'Source', href: '#' }] } },
    ]},
  { year: '2024', title: 'THIRD YEAR', theme: 'Scale',
    secret: '[TODO honest failure] My internship laptop had 4 GB of RAM. I learned to profile because I had to, and shipped a 40% faster list because of it.',
    signpost: { quote: '[TODO real quote] "Found the performance bug nobody else could reproduce and wrote it up so nobody has to again."', by: 'Engineering Manager, Summer Internship', href: 'https://linkedin.com/' },
    items: [
      { type: 'skill', title: 'Full stack, real users', text: '[TODO] React front end, Node and MongoDB back end for a campus events app with 400 users.', why: 'Users do things you never imagined; logging taught me more than any tutorial.', lesson: 'Add logging and a feedback button on day one.', details: { level: 4, tech: ['React', 'Node.js', 'Express', 'MongoDB'] } },
      { type: 'cert', title: 'AWS Cloud Practitioner', text: '[TODO] Learned what a VPC is; deployed to EC2 at 2 AM.', why: 'Understanding where code runs changed how I write it.', lesson: 'Set a billing alarm before the first deploy.', details: { tech: ['AWS', 'EC2', 'S3'] } },
      { type: 'contest', title: 'Smart India Hackathon finalist', text: '[TODO] Civic-issue reporting platform; 36 hours, five teammates, one shared Figma.', why: 'My job became unblocking others, not writing the most code.', lesson: 'Agree on interfaces first, then split the work.', details: { tech: ['React', 'Firebase', 'Maps API'] } },
      { type: 'project', title: 'Internship: shipped to production', text: '[TODO] Frontend intern at a startup; owned the onboarding flow end to end.', why: 'First code review from a senior engineer. Every comment was about naming and edge cases, not syntax.', lesson: 'Write the PR description for the reviewer, not for yourself.', details: { tech: ['Next.js', 'Tailwind', 'Figma'] } },
    ]},
  { year: '2025', title: 'FINAL YEAR', theme: 'Ownership',
    secret: '[TODO honest failure] The first version of this portfolio was a neon CSS experiment that looked generated. I threw it away and started from real game design.',
    signpost: { quote: '[TODO real quote] "Reviews juniors\' PRs with more care than most people review their own."', by: 'Maintainer, open-source project' },
    items: [
      { type: 'skill', title: 'TypeScript and systems thinking', text: '[TODO] Strict TypeScript, Next.js, and a portfolio that is a game with a tested architecture.', why: 'Types turned refactors from scary to boring, which is the point.', lesson: 'Model the data first; the UI follows.', details: { level: 5, tech: ['TypeScript', 'Next.js', 'Vite'] } },
      { type: 'project', title: 'Capstone: AI study planner', text: '[TODO] 500+ users during exam season; one outage, one post-mortem.', why: 'Wrote my first incident report. Owning the failure was the most senior thing I did that year.', lesson: 'Rate-limit the expensive endpoint before launch, not after.', details: { tech: ['Next.js', 'Supabase', 'OpenAI API'], links: [{ label: 'Live demo', href: '#' }, { label: 'Post-mortem', href: '#' }] } },
      { type: 'cert', title: 'Google UX Design', text: '[TODO] Learned that users do not read. Including this card.', why: 'Gave me a vocabulary to argue for users in design discussions.', lesson: 'Prototype on paper before opening Figma.' },
      { type: 'contest', title: '12 merged open-source PRs', text: '[TODO] Four repositories, mostly docs and accessibility fixes at first, then a feature.', why: 'Learned how real teams communicate asynchronously and disagree politely.', lesson: 'Read the last 20 merged PRs before opening your first.', details: { links: [{ label: 'Pull requests', href: 'https://github.com/pulls' }] } },
    ]},
];

export const FINALE: Finale = {
  title: 'RUN COMPLETE',
  text: 'B.Tech Computer Science, 2026.',
  next: '[TODO one sentence] Next I want to build front ends that feel instant on slow phones, and help a team ship them with the same care every week.',
  links: [
    { label: 'GitHub',   href: 'https://github.com/yourname' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/yourname' },
    { label: 'Resume',   href: 'resume.pdf' },
    { label: 'Email',    href: 'mailto:you@example.com' },
  ],
};
