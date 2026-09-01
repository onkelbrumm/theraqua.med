const API_BASE = import.meta.env.VITE_API_URL

export function mediaUrl(path) {
  return `${API_BASE}${path}`
}

export async function getSiteInfo() {
  const res = await fetch(`${API_BASE}/wp-json/`)
  if (!res.ok) throw new Error('WP-Root-Endpoint nicht erreichbar')
  return res.json()
}

export async function getPageBySlug(slug) {
  const res = await fetch(
    `${API_BASE}/wp-json/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=id,slug,title,content,link`,
  )
  if (!res.ok) throw new Error(`WP-Seite "${slug}" konnte nicht geladen werden`)
  const pages = await res.json()
  return pages[0] ?? null
}

export function elementorCssUrl(pageId) {
  return `${API_BASE}/wp-content/uploads/elementor/css/post-${pageId}.css`
}
