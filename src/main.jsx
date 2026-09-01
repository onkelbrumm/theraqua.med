import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './styles/brand-colors.css'
import App from './App.jsx'

// Muss zum "base" in vite.config.js passen (GitHub Pages ohne Custom Domain
// liefert das Projekt unter /theraqua.med/ aus).
const basename = import.meta.env.PROD ? '/theraqua.med' : '/'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
