import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Navbar.css';

const Navbar = ({ fromPage }) => {
  const [isClicked, setIsClicked] = useState(false);
  const navigate = useNavigate(); // Hook for navigation
  
  const navItems = [
    'Art',
    'Beverages', 
    'Clothing',
    'Food',
    'Furniture',
    'Jewelry',
    'Pottery',
    'Soap'
  ];

  const handleNavigation = () => {
    if (fromPage === 'registerPage') {
      navigate('/');
    } else {
      navigate('/register'); 
    }
  };

  return (
    <nav className='navbar'>
      <div className='navbar-grid'>
        <div className="brand-container">
          <img src={logo} alt="Ritsanal Market Logo" className="navbar-logo" />
          <span className="brand-name">Rtisanal Market</span>
        </div>

        {navItems.map((item, index) => (
          <div key={index} className="navbar-col">
            <span className="nav-item">{item}</span>
          </div>
        ))}
        
        <div className="navbar-col">
          <button 
            className={`home-button ${isClicked ? 'clicked' : fromPage === 'registerPage' ? '' : 'blinking'}`}
            onClick={handleNavigation}
            onMouseDown={() => setIsClicked(true)}
            onMouseUp={() => setIsClicked(false)}
            onMouseLeave={() => setIsClicked(false)}
          >
            {fromPage === 'registerPage' ? 'Home' : 'Register'}
          </button>
        </div>       
      </div>
    </nav>
  );
};

export default Navbar;