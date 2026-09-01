import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import headerHtml from '../wp-templates/header.html?raw'
import { getSiteInfo } from '../lib/wp'
import { useInternalLinks } from '../lib/useInternalLinks'
import './SiteHeader.css'

const normalizePath = (path) => path.replace(/\/+$/, '') || '/'

function SiteHeader() {
  const containerRef = useRef(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  useInternalLinks(containerRef)

  // Logo bleibt mit der WP-Mediathek verbunden: die aktuelle Logo-Datei
  // wird live über den öffentlichen /wp-json/ Root-Endpunkt (site_icon_url)
  // geladen, statt fest verdrahtet zu sein.
  useEffect(() => {
    getSiteInfo()
      .then((info) => {
        if (!info.site_icon_url) return
        const logoImg = containerRef.current?.querySelector(
          '.elementor-widget-theme-site-logo img',
        )
        if (logoImg) logoImg.src = info.site_icon_url
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const toggle = containerRef.current?.querySelector('.wpr-mobile-toggle')
    const menu = containerRef.current?.querySelector('.wpr-mobile-nav-menu')
    if (!toggle || !menu) return

    function onToggle() {
      setMobileOpen((open) => !open)
    }
    toggle.addEventListener('click', onToggle)
    return () => toggle.removeEventListener('click', onToggle)
  }, [])

  useEffect(() => {
    const menu = containerRef.current?.querySelector('.wpr-mobile-nav-menu')
    if (menu) menu.style.display = mobileOpen ? 'block' : 'none'
  }, [mobileOpen])

  // Der aktive Menüpunkt ist im gescrapten Markup fest auf "Startseite"
  // eingefroren - hier auf Basis der aktuellen Route aktualisiert.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const currentPath = normalizePath(location.pathname)
    const links = container.querySelectorAll('.wpr-nav-menu a, .wpr-mobile-nav-menu a')

    links.forEach((link) => {
      let linkPath
      try {
        linkPath = new URL(link.getAttribute('href') || '', window.location.origin).pathname
      } catch {
        linkPath = ''
      }
      const isActive = normalizePath(linkPath) === currentPath
      const li = link.closest('li')

      link.classList.toggle('wpr-active-menu-item', isActive)
      if (isActive) {
        link.setAttribute('aria-current', 'page')
      } else {
        link.removeAttribute('aria-current')
      }
      li?.classList.toggle('current-menu-item', isActive)
      li?.classList.toggle('current_page_item', isActive)
    })
  }, [location.pathname])

  return (
    <header
      ref={containerRef}
      className="site-header"
      dangerouslySetInnerHTML={{ __html: headerHtml }}
    />
  )
}

export default SiteHeader
