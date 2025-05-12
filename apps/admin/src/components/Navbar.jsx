import React from 'react';
import { useNavigate } from "react-router-dom";
import Logo from '../assets/logo.png';
import './Navbar.css';
import axios from 'axios';

const Navbar = ({ isLoggedIn, toggleSidebar }) => {
    const navigate = useNavigate();
    
    const handleLogout = async () => {
        try {
            const response = await axios.post('https://naom0qtxma.execute-api.us-east-1.amazonaws.com/api/logout', {}, {
                withCredentials: true, 
            });
            if (response.status === 200) {
                console.log('Logout successful');
                navigate('/');
            } else {
                console.error('Logout failed');
            }
        }
        catch (error) {
            console.error('Error during logout:', error);
        }
    }
    
    return (
        <nav className="navbar">
            <div className="navbar-left">
                {isLoggedIn && (
                    <div className="hamburger" onClick={toggleSidebar}>
                        ☰
                    </div>
                )}
                <div className="navbar-brand" onClick={(e) => navigate('/home')}>
                    <img src={Logo} alt="Market Logo" className="navbar-logo" />
                    <span className="navbar-brand-name">Rtisanal Market</span>
                </div>
            </div>
            {isLoggedIn && (
                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            )}
        </nav>
    );
};

export default Navbar;