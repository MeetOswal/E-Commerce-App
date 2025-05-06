import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RegisterPage from './pages/RegisterPage' // Make sure to create this component
import LandingPage from './pages/LandingPage'
import PricingPage from './pages/PricingPage'
import ContactPage from './pages/ContactPage'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  </StrictMode>
)