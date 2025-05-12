import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/SideBar';
import axios from 'axios';
import './WelcomePage.css'; // Import the CSS file
const WelcomePage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get('https://naom0qtxma.execute-api.us-east-1.amazonaws.com/api/check-auth', {
                    withCredentials: true,
                });
                console.log(response.data);
                setIsLoggedIn(true);
            } catch (error) {
                setIsLoggedIn(false);
                navigate('/');
                console.error('Error fetching data:', error);
            }
        };

        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 650);
            // Close sidebar when resizing to mobile
            if (window.innerWidth <= 650) {
                setIsSidebarOpen(false);
            }
        };

        checkAuth();
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        
        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, [navigate]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div>
            <Navbar 
                isLoggedIn={isLoggedIn} 
                toggleSidebar={toggleSidebar}
            />
            <Sidebar 
                isMobile={isMobile} 
                isSidebarOpen={isSidebarOpen} 
                toggleSidebar={toggleSidebar}
            />
            <div className='welcome-container'>
                <h1>Welcome to the Admin Dashboard</h1>
            </div>
        </div>
    );
};

export default WelcomePage;