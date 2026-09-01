import { useEffect, useState } from 'react'

// Gibt zurück, ob das Stylesheet fertig geladen ist. Wichtig für Code, das
// erst nach dem Laden layouten darf (z.B. Grid-Spaltenbreiten messen) -
// lokal/im Cache ist das Laden meist sofort fertig, auf einem frischen
// Produktions-Load (anderer Host, kein Cache) kann es spürbar dauern.
export function useStylesheet(href) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
    if (!href) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.onload = () => setLoaded(true)
    link.onerror = () => setLoaded(true)
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [href])

  return loaded
}
