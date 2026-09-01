import { useRef } from 'react'
import footerHtml from '../wp-templates/footer.html?raw'
import { useInternalLinks } from '../lib/useInternalLinks'

function SiteFooter() {
  const containerRef = useRef(null)
  useInternalLinks(containerRef)

  return (
    <footer
      ref={containerRef}
      className="site-footer"
      dangerouslySetInnerHTML={{ __html: footerHtml }}
    />
  )
}

export default SiteFooter
