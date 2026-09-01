// ".wpr-instagram-feed" startet per CSS bei opacity:0 - genau wie
// ".wpr-grid" beim Media-Grid-Widget - und wird normalerweise von Royal
// Addons' eigenem JS nach dem Aufbau des Layouts auf opacity:1 gesetzt. Da
// diese Laufzeit hier nicht läuft, blieb der komplette Feed unsichtbar,
// obwohl Bilder und Layout technisch korrekt waren.
export function enhanceInstagramFeed(root) {
  const feeds = root.querySelectorAll('.wpr-instagram-feed')
  const wraps = root.querySelectorAll('.wpr-insta-feed-media-wrap')
  if (!feeds.length && !wraps.length) return () => {}

  feeds.forEach((feed) => {
    feed.style.opacity = '1'
  })

  // Zusätzlich die Höhe der quadratischen Kacheln deterministisch per Pixel
  // setzen statt uns auf den "padding-bottom: 100%"-CSS-Trick zu verlassen,
  // der bei mehrfach verschachtelten position:absolute-Eltern nicht immer
  // zuverlässig eine Höhe ergibt.
  function applyHeights() {
    wraps.forEach((wrap) => {
      const width = wrap.getBoundingClientRect().width
      if (width > 0) {
        wrap.style.height = `${width}px`
      }
    })
  }

  applyHeights()

  const onResize = () => applyHeights()
  window.addEventListener('resize', onResize)
  return () => window.removeEventListener('resize', onResize)
}
