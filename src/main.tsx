import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { FeedProvider } from './context/FeedContext'
import { SubscriberProvider } from './context/SubscriberContext'
import App from './App'
import './index.css'

function Root() {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        document.querySelector<HTMLButtonElement>('[aria-label="Open search"]')?.click()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

  return (
    <StrictMode>
      <BrowserRouter basename={basename}>
        <AppProvider>
          <SubscriberProvider>
            <FeedProvider>
              <App />
            </FeedProvider>
          </SubscriberProvider>
        </AppProvider>
      </BrowserRouter>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')!).render(<Root />)
