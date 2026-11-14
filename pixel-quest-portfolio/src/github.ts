// GitHub public API with a 24h localStorage cache: 60 unauthenticated calls/hour/IP is easy to exhaust on launch day.
export interface GithubStats { repos: number; followers: number; top: { name: string; stars: number; url: string }[]; cachedAt: number }
const TTL = 24 * 60 * 60 * 1000;

export async function githubStats(user: string): Promise<GithubStats | null> {
  const key = `gh:${user}`;
  try { const hit = JSON.parse(localStorage.getItem(key) ?? 'null') as GithubStats | null; if (hit && Date.now() - hit.cachedAt < TTL) return hit; } catch { /* storage blocked */ }
  try {
    const [u, repos] = await Promise.all([
      fetch(`https://api.github.com/users/${user}`).then(r => r.ok ? r.json() : null),
      fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=updated`).then(r => r.ok ? r.json() : []),
    ]);
    if (!u?.login) return null;
    const top = (Array.isArray(repos) ? repos : []).sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 3)
      .map(r => ({ name: r.name as string, stars: r.stargazers_count as number, url: r.html_url as string }));
    const stats: GithubStats = { repos: u.public_repos, followers: u.followers, top, cachedAt: Date.now() };
    try { localStorage.setItem(key, JSON.stringify(stats)); } catch { /* storage blocked */ }
    return stats;
  } catch { return null; }
}
