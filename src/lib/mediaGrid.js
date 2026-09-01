import { loadScript } from './loadScript'

const API_BASE = import.meta.env.VITE_API_URL

function readSettings(grid, widget) {
  try {
    return JSON.parse(grid.getAttribute('data-settings') || widget?.getAttribute('data-settings') || '{}')
  } catch {
    return {}
  }
}

// columns_tablet/columns_mobile stehen nicht in data-settings, nur als
// Responsive-Klassen am Widget (wpr-grid-columns--tablet3 etc.).
function getColumnCount(widgetEl, settings) {
  const cls = widgetEl?.className ?? ''
  const width = window.innerWidth
  const read = (suffix) => {
    const m = cls.match(new RegExp(`wpr-grid-columns--${suffix}(\\d+)`))
    return m ? parseInt(m[1], 10) : null
  }
  const base = parseInt(settings.columns_desktop, 10) || 3

  if (width < 768) return read('mobile') ?? 1
  if (width < 1025) return read('tablet') ?? base
  if (width < 1366) return read('laptop') ?? base
  return base
}

function waitForImages(container) {
  const images = Array.from(container.querySelectorAll('img'))
  return Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve()
      return new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true })
        img.addEventListener('error', resolve, { once: true })
      })
    }),
  )
}

// Das WP-Plugin (Royal Addons "Media Grid") positioniert Kacheln selbst per
// JS absolut (kein Isotope). Wir bilden dasselbe Prinzip nach, weil wir die
// Original-JS-Laufzeit hier nicht laden.
function layoutGrid(grid) {
  const items = Array.from(grid.children).filter((el) =>
    el.classList.contains('wpr-grid-item'),
  )
  if (!items.length) return

  // Zurück in den normalen Fluss setzen, bevor gemessen wird: absolut
  // positionierte Kacheln aus einem vorherigen Durchlauf (Resize, React
  // StrictMode Doppel-Ausführung) tragen sonst nicht mehr zur Breite des
  // Containers bei, wodurch dieser auf 0 kollabieren würde.
  items.forEach((item) => {
    item.style.position = ''
    item.style.width = ''
    item.style.left = ''
    item.style.top = ''
  })
  grid.style.height = ''

  const widget = grid.closest('[class*="elementor-widget-wpr-media-grid"]')
  const settings = readSettings(grid, widget)
  const gutter = Number(settings.gutter_hr) || 10
  const columns = Math.max(1, getColumnCount(widget, settings))
  const containerWidth = grid.clientWidth
  const colWidth = containerWidth / columns
  const itemWidth = colWidth - gutter
  const colHeights = new Array(columns).fill(0)

  items.forEach((item) => {
    item.style.position = 'absolute'
    item.style.width = `${itemWidth}px`
  })

  items.forEach((item) => {
    let col = 0
    for (let i = 1; i < columns; i++) {
      if (colHeights[i] < colHeights[col]) col = i
    }
    item.style.left = `${col * colWidth}px`
    item.style.top = `${colHeights[col]}px`
    colHeights[col] += item.getBoundingClientRect().height + gutter
  })

  grid.style.position = 'relative'
  grid.style.height = `${Math.max(...colHeights, 0)}px`
  grid.style.opacity = '1'
}

async function ensureLightGallery() {
  if (window.jQuery?.fn?.lightGallery) return window.jQuery
  await loadScript(`${API_BASE}/wp-includes/js/jquery/jquery.min.js`)
  await loadScript(
    `${API_BASE}/wp-content/plugins/royal-elementor-addons/assets/js/lib/lightgallery/lightgallery.min.js`,
  )
  return window.jQuery
}

// data-settings liefert Strings ("true"/"") statt Booleans - für die
// lightGallery-Optionen zurückwandeln.
function toLightGalleryOptions(lightbox) {
  const bool = (v) => v === true || v === 'true'
  return {
    selector: lightbox.selector || '.wpr-grid-image-wrap',
    thumbnail: bool(lightbox.thumbnail),
    download: bool(lightbox.download),
    counter: bool(lightbox.counter),
    controls: bool(lightbox.controls),
    zoom: bool(lightbox.zoom),
    fullScreen: bool(lightbox.fullScreen),
    autoplay: bool(lightbox.autoplay),
    pause: Number(lightbox.pause) || 5000,
  }
}

// Sucht alle Royal-Addons "Media Grid" Widgets (die Startseiten-Galerie)
// innerhalb von `root`, ordnet die Kacheln als Masonry-Raster an und
// aktiviert die Lightbox beim Klick auf ein Bild.
export async function enhanceMediaGrids(root) {
  const widgets = root.querySelectorAll('[class*="elementor-widget-wpr-media-grid"]')
  if (!widgets.length) return () => {}

  const cleanups = []

  for (const widget of widgets) {
    const grid = widget.querySelector('.wpr-grid')
    if (!grid) continue

    const loadMoreBtn = widget.querySelector('.wpr-grid-pagination-load-more')
    if (loadMoreBtn) loadMoreBtn.style.display = 'none'

    await waitForImages(grid)
    layoutGrid(grid)

    const onResize = () => layoutGrid(grid)
    window.addEventListener('resize', onResize)
    cleanups.push(() => window.removeEventListener('resize', onResize))

    if (grid.querySelector('.wpr-grid-item-lightbox')) {
      try {
        const $ = await ensureLightGallery()
        const settings = readSettings(grid, widget)
        $(grid).lightGallery(toLightGalleryOptions(settings.lightbox || {}))
        cleanups.push(() => {
          try {
            $(grid).data('lightGallery')?.destroy(true)
          } catch {
            /* noop */
          }
        })
      } catch {
        /* Lightbox ist ein Komfort-Feature, kein harter Fehler */
      }
    }
  }

  return () => cleanups.forEach((fn) => fn())
}
