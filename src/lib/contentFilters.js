// Einzelne Bilder, die aus dem WP-Seiteninhalt entfernt werden sollen, ohne
// dass wir Schreibzugriff auf die WordPress-Installation haben. Dateiname
// reicht als Match (unabhängig von Upload-Jahr/Monat im Pfad).
const EXCLUDED_IMAGE_FILENAMES = ['gallery-8.jpg']

export function filterContentHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')

  doc.querySelectorAll('img').forEach((img) => {
    if (!EXCLUDED_IMAGE_FILENAMES.some((name) => img.src.includes(name))) return
    const item = img.closest('.wpr-grid-item') || img.closest('article') || img
    item.remove()
  })

  // Vereinzelte Bilder, die direkt im klassischen WP-Inhaltsfeld stecken
  // (nicht im Elementor-Layout platziert) - erkennbar an diesem
  // Standard-Markup, das WordPress dafür automatisch erzeugt.
  doc.querySelectorAll('p.attachment').forEach((el) => el.remove())

  // "Follow on Instagram"-Button zeigt noch auf den Demo-Account des
  // Theme-Anbieters statt auf den echten Theraqua-Account.
  doc.querySelectorAll('.wpr-instagram-follow-btn').forEach((el) => {
    el.href = 'https://www.instagram.com/theraquamedhaan/'
  })

  return doc.body.innerHTML
}
