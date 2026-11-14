declare module 'animejs/lib/anime.es.js' {
  // minimal typing: the project only uses anime(), anime.timeline() and anime.stagger()
  interface AnimeInstance { play(): void; pause(): void; add(params: Record<string, unknown>): AnimeInstance }
  interface Anime { (params: Record<string, unknown>): AnimeInstance; timeline(params?: Record<string, unknown>): AnimeInstance; stagger(v: number): unknown }
  const anime: Anime;
  export default anime;
}
