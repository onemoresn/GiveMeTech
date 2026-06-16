import { Routes, Route } from 'react-router-dom'
import { NavBar } from './components/layout/NavBar'
import { NewsTicker } from './components/layout/NewsTicker'
import { Footer } from './components/layout/Footer'
import { NewsletterSignup } from './components/features/NewsletterSignup'
import { HomePage } from './pages/HomePage'
import { SectionPage } from './pages/SectionPage'

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NewsTicker />
      <NavBar />
      <main id="main-content">{children}</main>
      <NewsletterSignup />
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppLayout>
            <HomePage />
          </AppLayout>
        }
      />
      <Route path="/ai" element={<AppLayout><SectionPage sectionId="ai" /></AppLayout>} />
      <Route path="/cybersecurity" element={<AppLayout><SectionPage sectionId="cybersecurity" /></AppLayout>} />
      <Route path="/gadgets" element={<AppLayout><SectionPage sectionId="gadgets" /></AppLayout>} />
      <Route path="/software" element={<AppLayout><SectionPage sectionId="software" /></AppLayout>} />
      <Route path="/space" element={<AppLayout><SectionPage sectionId="space" /></AppLayout>} />
      <Route path="/gaming" element={<AppLayout><SectionPage sectionId="gaming" /></AppLayout>} />
      <Route path="/cars" element={<AppLayout><SectionPage sectionId="cars" /></AppLayout>} />
    </Routes>
  )
}
