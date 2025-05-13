import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import './index.css'
import AddFashion from './pages/AddFashion'
import AddFood from './pages/AddFood'
import AddJewelry from './pages/AddJewelry'
import WelcomePage from './pages/WelcomePage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
      <Route path="/addfashion" element={<AddFashion />} />
      <Route path="/addfood" element={<AddFood />} />
      <Route path="/addjewelry" element={<AddJewelry />} />
      <Route path="/home" element={<WelcomePage />} />
      <Route path="/*" element={<Login />} />
      </Routes>
    </Router>
  </StrictMode>
)