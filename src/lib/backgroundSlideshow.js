const API_BASE = import.meta.env.VITE_API_URL
const API_HOST = new URL(API_BASE).host

// Manche Medien-URLs in den WP-Einstellungen zeigen auf eine kaputte/fremde
// Subdomain (z.B. "wordpress.p712308...") statt der eigentlichen Website-Domain.
function normalizeUrl(url) {
  try {
    const parsed = new URL(url)
    parsed.protocol = 'https:'
    parsed.host = API_HOST
    return parsed.toString()
  } catch {
    return url
  }
}

function parseSlideshowSettings(el) {
  try {
    const settings = JSON.parse(el.getAttribute('data-settings') || '{}')
    if (settings.background_background !== 'slideshow') return null
    const gallery = settings.background_slideshow_gallery
    if (!Array.isArray(gallery) || !gallery.length) return null
    return {
      images: gallery.map((img) => normalizeUrl(img.url)),
      duration: Number(settings.background_slideshow_slide_duration) || 5000,
      kenBurns: settings.background_slideshow_ken_burns === 'yes',
    }
  } catch {
    return null
  }
}

function buildSlideshowEl(config) {
  const wrap = document.createElement('div')
  wrap.className = 'elementor-background-slideshow'
  wrap.innerHTML = config.images
    .map(
      (url, i) =>
        `<div class="elementor-background-slideshow__slide wpr-bg-slide${i === 0 ? ' wpr-bg-slide-active' : ''}">
           <div class="elementor-background-slideshow__slide__image wpr-bg-slide-image${config.kenBurns ? ' wpr-bg-slide-kenburns' : ''}" style="background-image:url('${url}')"></div>
         </div>`,
    )
    .join('')
  return wrap
}

// Elementor rendert diesen Hintergrund normalerweise per JS (Swiper) - im
// content.rendered HTML steckt nur die Konfiguration in data-settings, keine
// <img>-Elemente. Wir bauen die Diashow selbst nach: crossfade zwischen den
// Bildern, optional mit sanftem Ken-Burns-Zoom.
//
// Auf manchen Produktions-Loads wurde die eingefügte Diashow kurz nach dem
// Einfügen wieder aus dem DOM entfernt (vermutlich ein erneuter Reconcile
// von dangerouslySetInnerHTML). Ein MutationObserver fragt die Sektionen
// daher bei jeder Korrektur frisch vom Root ab, statt einmalig eingefangene
// Elementreferenzen weiterzuverwenden, die dabei veralten könnten.
export function enhanceBackgroundSlideshows(root) {
  if (!root.querySelector('[data-settings*="background_background"]')) return () => {}

  const timers = new Set()

  function ensureAll() {
    root.querySelectorAll('[data-settings*="background_background"]').forEach((section) => {
      const config = parseSlideshowSettings(section)
      if (!config) return
      if (section.querySelector(':scope > .elementor-background-slideshow')) return

      if (getComputedStyle(section).position === 'static') {
        section.style.position = 'relative'
      }

      const wrap = buildSlideshowEl(config)
      section.insertBefore(wrap, section.firstChild)

      if (config.images.length > 1) {
        let index = 0
        const slides = wrap.querySelectorAll('.wpr-bg-slide')
        const timer = setInterval(() => {
          slides[index].classList.remove('wpr-bg-slide-active')
          index = (index + 1) % slides.length
          slides[index].classList.add('wpr-bg-slide-active')
        }, config.duration)
        timers.add(timer)
      }
    })
  }

  ensureAll()

  const observer = new MutationObserver(() => ensureAll())
  observer.observe(root, { childList: true, subtree: true })

  // Zusätzliches Sicherheitsnetz für den Fall, dass der Reset auf eine Art
  // passiert, die der MutationObserver nicht als childList-Änderung erfasst.
  const pollId = setInterval(ensureAll, 1000)

  return () => {
    observer.disconnect()
    clearInterval(pollId)
    timers.forEach((t) => clearInterval(t))
    root.querySelectorAll('.elementor-background-slideshow').forEach((el) => el.remove())
  }
}
