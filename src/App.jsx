import { Route, Routes } from 'react-router-dom'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import WpPage from './pages/WpPage'

const routes = [
  { path: '/', slug: 'startseite' },
  { path: '/ueber-uns', slug: 'ueber-uns' },
  { path: '/kursangebot', slug: 'kursangebot' },
  { path: '/preise-krankenkassenzuschuss', slug: 'preise-krankenkassenzuschuss' },
  { path: '/kontakt-anfahrt', slug: 'kontakt-anfahrt' },
  { path: '/kursinfos', slug: 'kursinfos' },
]

function App() {
  return (
    <>
      <SiteHeader />
      <Routes>
        {routes.map(({ path, slug }) => (
          <Route key={path} path={path} element={<WpPage slug={slug} />} />
        ))}
      </Routes>
      <SiteFooter />
    </>
  )
}

export default App
