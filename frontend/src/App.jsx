import { useState } from 'react'
import LandingPage from './LandingPage'
import Dashboard from './Dashboard'
import './App.css'

function App() {
  // State to manage current view: 'landing' or 'dashboard'
  const [currentView, setCurrentView] = useState('landing')

  const handleStartDemo = () => {
    setCurrentView('dashboard')
    // Scroll to top when switching views
    window.scrollTo(0, 0)
  }

  const handleBackToHome = () => {
    setCurrentView('landing')
    window.scrollTo(0, 0)
  }

  return (
    <>
      {currentView === 'landing' ? (
        <LandingPage onStartDemo={handleStartDemo} />
      ) : (
        <Dashboard onBack={handleBackToHome} />
      )}
    </>
  )
}

export default App
