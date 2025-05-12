import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import './index.css'
import AddItem from './pages/AddItem'
import WelcomePage from './pages/WelcomePage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
      <Route path="/additem" element={<AddItem />} />
      <Route path="/home" element={<WelcomePage />} />
      <Route path="/*" element={<Login />} />
      </Routes>
    </Router>
  </StrictMode>
)