// ─── Edit this file only. Every app on the desktop reads from here. ───
export const PROFILE = {
  name: 'Your Name',
  handle: 'yourname',
  role: 'Frontend Developer',
  tagline: 'I build fast, polished interfaces for the web.',
  location: 'Bengaluru, India',
  email: 'you@example.com',
  phone: '+91 00000 00000',
  avatar: '', // URL or /avatar.jpg in public/. Empty = initials.
  resumePdf: (import.meta.env?.BASE_URL ?? '/') + 'resume.pdf', // ?. so this file also loads in plain Node (scripts/validate-content.mjs) // drop your PDF in public/
  links: {
    github: 'https://github.com/yourname',
    linkedin: 'https://linkedin.com/in/yourname',
    twitter: 'https://x.com/yourname',
    website: 'https://yourname.dev',
  },
  about: `Hi, I'm Your Name, a frontend developer who cares about the details: motion that feels right, layouts that hold up at every size, and code that the next person can read.

I'm finishing my B.Tech in Computer Science (class of 2026) and have shipped production UI at a startup internship, reached a national hackathon final, and maintain a few open-source tools.

Outside work I take photographs, run, and rebuild the same personal site every year.`,
  now: [
    'Building this macOS-style portfolio',
    'Learning Rust for a side project',
    'Open to frontend roles starting mid-2026',
  ],
};

export const SKILLS = [
  { group: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'C++', 'SQL'] },
  { group: 'Frontend', items: ['React', 'Next.js', 'Vite', 'Tailwind', 'Framer Motion', 'Three.js'] },
  { group: 'Backend', items: ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Supabase', 'Firebase'] },
  { group: 'Tools', items: ['Git', 'Figma', 'Docker', 'AWS', 'Playwright', 'Vitest'] },
];

export const PROJECTS = [
  {
    slug: 'study-planner',
    name: 'AI Study Planner',
    year: 2025,
    tagline: 'Exam planner used by 500+ students in one season.',
    description: 'A Next.js app that turns a syllabus and exam date into a day-by-day plan. Rate-limited OpenAI calls, Supabase auth with row-level security, and an offline-first PWA shell.',
    tech: ['Next.js', 'Supabase', 'OpenAI API', 'PWA'],
    url: 'https://example.com',
    repo: 'https://github.com/yourname/study-planner',
    color: '#5e5ce6',
    image: '', // optional screenshot URL (or /projects/x.png in public/)
    highlights: ['500+ weekly users during exams', 'One outage, one public post-mortem', 'Lighthouse 98 performance'],
  },
  {
    slug: 'campus-events',
    name: 'Campus Events',
    year: 2024,
    tagline: 'Event discovery for 400 students on campus.',
    description: 'React + Node + MongoDB. Real-time RSVP counts over WebSockets, QR check-in, and an admin dashboard. First project with real users and real logging.',
    tech: ['React', 'Node.js', 'MongoDB', 'Socket.IO'],
    url: 'https://example.com',
    repo: 'https://github.com/yourname/campus-events',
    color: '#ff9f0a',
    image: '',
    highlights: ['400 registered users', 'QR check-in in under 1s', 'Admin analytics dashboard'],
  },
  {
    slug: 'civic-report',
    name: 'Civic Report',
    year: 2024,
    tagline: 'Smart India Hackathon finalist.',
    description: 'Citizens report local issues with a photo and a map pin; municipal staff triage on a kanban board. Built in 36 hours with five teammates and one shared Figma.',
    tech: ['React', 'Firebase', 'Maps API'],
    url: 'https://example.com',
    repo: 'https://github.com/yourname/civic-report',
    color: '#30d158',
    image: '',
    highlights: ['National finalist', 'Built in 36 hours', 'Geo-tagged photo reports'],
  },
  {
    slug: 'weather',
    name: 'Weather, Cached',
    year: 2023,
    tagline: 'A weather app that survived a 429.',
    description: 'My first API project. Got rate-limited mid-demo, so I learned caching, stale-while-revalidate and designing the error state before the happy path.',
    tech: ['Fetch API', 'OpenWeather', 'CSS Grid'],
    url: 'https://example.com',
    repo: 'https://github.com/yourname/weather',
    color: '#64d2ff',
    image: '',
    highlights: ['Offline cache', 'Graceful error states', 'Zero dependencies'],
  },
];

export const EXPERIENCE = [
  {
    company: 'Startup Co.',
    role: 'Frontend Engineering Intern',
    period: 'May 2024 – Aug 2024',
    location: 'Remote',
    bullets: [
      'Owned the onboarding flow end to end in Next.js and Tailwind; conversion up 18%.',
      'Found and documented a list-rendering performance bug; shipped a 40% faster list.',
      'Wrote PR descriptions for reviewers; adopted as the team template.',
    ],
  },
  {
    company: 'Open Source',
    role: 'Maintainer',
    period: '2023 – Present',
    location: 'GitHub',
    bullets: [
      'Maintain two small developer tools with ~1k monthly downloads.',
      'Review contributor PRs with a focus on naming and edge cases.',
    ],
  },
];

export const EDUCATION = [
  { school: 'Your University', degree: 'B.Tech, Computer Science & Engineering', period: '2022 – 2026', note: 'CGPA 8.7 / 10' },
];

export const CERTS = [
  { name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', year: 2024 },
  { name: 'Google UX Design', issuer: 'Google', year: 2025 },
  { name: 'Responsive Web Design', issuer: 'freeCodeCamp', year: 2023 },
];
