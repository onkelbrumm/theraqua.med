import { useEffect, useRef, useState } from 'react'
import { getPageBySlug, getSiteInfo, elementorCssUrl } from '../lib/wp'
import { useStylesheet } from '../lib/useStylesheet'
import { useInternalLinks } from '../lib/useInternalLinks'
import { enhanceMediaGrids } from '../lib/mediaGrid'
import { enhanceBackgroundSlideshows } from '../lib/backgroundSlideshow'
import { enhanceInstagramFeed } from '../lib/instagramFeed'
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

  const stylesheetLoaded = useStylesheet(page ? elementorCssUrl(page.id) : null)

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
    const watchedMain = containerRef.current
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.removedNodes.forEach((n) => {
          if (n.nodeType !== 1) return
          if (n.classList?.contains('elementor-background-slideshow')) {
            console.error('[WpPage] slideshow div removed! target:', m.target, 'stack:', new Error().stack)
          }
          if (n === watchedMain || n.tagName === 'MAIN') {
            console.error('[WpPage] <main> itself removed/replaced!', n, 'stack:', new Error().stack)
          }
        })
      })
    })
    observer.observe(document.getElementById('root'), { childList: true, subtree: true })
    console.log('[WpPage] running slideshow/grid effect for page', page.id)
    let cleanupSlideshows = () => {}
    try {
      cleanupSlideshows = enhanceBackgroundSlideshows(containerRef.current)
    } catch (err) {
      console.error('[WpPage] enhanceBackgroundSlideshows threw', err)
    }
    let cleanupGrids = () => {}
    enhanceMediaGrids(containerRef.current)
      .then((fn) => {
        cleanupGrids = fn
      })
      .catch((err) => console.error('[WpPage] enhanceMediaGrids threw', err))
    return () => {
      console.log('[WpPage] cleaning up slideshow/grid effect for page', page.id)
      observer.disconnect()
      cleanupSlideshows()
      cleanupGrids()
    }
  }, [page])

  // Wartet auf das geladene Stylesheet, da die Instagram-Feed-Kacheln ihre
  // Breite über CSS-Grid-Spalten aus genau dieser Datei beziehen - vor dem
  // Laden hätte die Höhenmessung sonst eine falsche (zu große) Breite als
  // Grundlage.
  useEffect(() => {
    if (!page || !containerRef.current || !stylesheetLoaded) return
    return enhanceInstagramFeed(containerRef.current)
  }, [page, stylesheetLoaded])

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
