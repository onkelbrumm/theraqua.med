// ".wpr-instagram-feed" startet per CSS bei opacity:0 - genau wie
// ".wpr-grid" beim Media-Grid-Widget - und wird normalerweise von Royal
// Addons' eigenem JS nach dem Aufbau des Layouts auf opacity:1 gesetzt. Da
// diese Laufzeit hier nicht läuft, blieb der komplette Feed unsichtbar,
// obwohl Bilder und Layout technisch korrekt waren.
//
// Auf manchen Produktions-Loads wurde der Inhalt kurz nach dem Anwenden
// wieder zurückgesetzt (vermutlich ein erneuter Reconcile von
// dangerouslySetInnerHTML), wodurch sowohl die gesetzten Inline-Styles als
// auch unsere Elementreferenzen veraltet waren. Ein MutationObserver fragt
// die Elemente daher bei jeder Korrektur frisch vom Root ab, statt sie nur
// einmalig zu cachen.
export function enhanceInstagramFeed(root) {
  function applyFixes() {
    root.querySelectorAll('.wpr-instagram-feed').forEach((feed) => {
      feed.style.opacity = '1'
    })
    root.querySelectorAll('.wpr-insta-feed-media-wrap').forEach((wrap) => {
      const width = wrap.getBoundingClientRect().width
      if (width > 0) {
        wrap.style.height = `${width}px`
      }
    })
  }

  if (!root.querySelector('.wpr-instagram-feed, .wpr-insta-feed-media-wrap')) {
    return () => {}
  }

  // Ein Frame abwarten, damit der Browser ein gerade geladenes Stylesheet
  // sicher schon fürs Layout angewendet hat, bevor gemessen wird.
  const rafId = requestAnimationFrame(applyFixes)

  const onResize = () => applyFixes()
  window.addEventListener('resize', onResize)

  // Nur childList beobachten (nicht "style"-Attribute!), sonst würde unser
  // eigenes applyFixes() den Observer erneut triggern und eine Endlosschleife
  // erzeugen.
  const observer = new MutationObserver(() => applyFixes())
  observer.observe(root, { childList: true, subtree: true })

  // Zusätzliches Sicherheitsnetz für den Fall, dass der Reset auf eine Art
  // passiert, die der MutationObserver nicht als childList-Änderung erfasst.
  const pollId = setInterval(applyFixes, 1000)

  return () => {
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', onResize)
    observer.disconnect()
    clearInterval(pollId)
  }
}
