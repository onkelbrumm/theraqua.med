import { useEffect, useRef, useState } from 'react'
import { getPageBySlug, getSiteInfo, elementorCssUrl } from '../lib/wp'
import { useStylesheet } from '../lib/useStylesheet'
import { useInternalLinks } from '../lib/useInternalLinks'
import { enhanceMediaGrids } from '../lib/mediaGrid'
import { enhanceBackgroundSlideshows } from '../lib/backgroundSlideshow'
import { filterContentHtml } from '../lib/contentFilters'

function WpPage({ slug }) {
  const [page, setPage] = useState(null)
  const [error, setError] = useState(null)
  const containerRef = useRef(null)
  useInternalLinks(containerRef)

  useEffect(() => {
    setPage(null)
    setError(null)
    getPageBySlug(slug)
      .then((data) => {
        if (!data) throw new Error('Seite nicht gefunden')
        setPage({
          ...data,
          content: { ...data.content, rendered: filterContentHtml(data.content.rendered) },
        })
      })
      .catch((err) => setError(err.message))
  }, [slug])

  useStylesheet(page ? elementorCssUrl(page.id) : null)

  useEffect(() => {
    if (!page) return
    const el = document.createElement('textarea')
    el.innerHTML = page.title.rendered
    const title = el.value
    getSiteInfo()
      .then((info) => {
        document.title = info.name ? `${title} – ${info.name}` : title
      })
      .catch(() => {
        document.title = title
      })
  }, [page])

  useEffect(() => {
    if (!page || !containerRef.current) return
    const cleanupSlideshows = enhanceBackgroundSlideshows(containerRef.current)
    let cleanupGrids = () => {}
    enhanceMediaGrids(containerRef.current).then((fn) => {
      cleanupGrids = fn
    })
    return () => {
      cleanupSlideshows()
      cleanupGrids()
    }
  }, [page])

  if (error) {
    return <main className="wp-page-error">Fehler beim Laden der Seite: {error}</main>
  }

  if (!page) {
    return <main className="wp-page-loading">Lade Inhalt...</main>
  }

  return (
    <main
      ref={containerRef}
      className={`elementor elementor-${page.id}`}
      data-elementor-type="wp-page"
      data-elementor-id={page.id}
      dangerouslySetInnerHTML={{ __html: page.content.rendered }}
    />
  )
}

export default WpPage
