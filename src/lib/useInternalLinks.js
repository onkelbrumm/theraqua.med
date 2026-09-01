import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL

// Fängt Klicks auf <a href="https://<wp-domain>/..."> innerhalb des
// referenzierten Containers ab und navigiert stattdessen client-seitig,
// damit aus WordPress übernommenes Markup in der React-Route bleibt.
export function useInternalLinks(containerRef) {
  const navigate = useNavigate()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function handleClick(event) {
      const link = event.target.closest('a[href]')
      if (!link) return
      const href = link.getAttribute('href')
      if (!href || !href.startsWith(API_BASE)) return
      if (link.target === '_blank') return

      event.preventDefault()
      const path = href.slice(API_BASE.length) || '/'
      navigate(path)
    }

    container.addEventListener('click', handleClick)
    return () => container.removeEventListener('click', handleClick)
  }, [containerRef, navigate])
}
