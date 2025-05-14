import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RegisterPage from './pages/RegisterPage' // Make sure to create this component
import LandingPage from './pages/LandingPage'
import PricingPage from './pages/PricingPage'
import ContactPage from './pages/ContactPage'
import './index.css'
import CategoryPage from './pages/CategoryPage'
import Accounts from './pages/Accounts'
import UserForm from './pages/SignupPage'
import ItemPage from './pages/ItemPage'
import CartPage from './pages/CartPage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/account" element={<Accounts />} />
      <Route path="/signup" element={<UserForm />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/category/:name" element={<CategoryPage />} />
      <Route path="/item/:name" element={<ItemPage />} />
      <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  </StrictMode>
)