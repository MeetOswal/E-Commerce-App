import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './SideBar.css';
const Sidebar = ({ isMobile, isSidebarOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    
    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        if (!isMobile || !isSidebarOpen) return;
        
        const handleClickOutside = (e) => {
            if (!e.target.closest('.sidebar') && !e.target.closest('.hamburger')) {
                toggleSidebar();
            }
        };
        
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isMobile, isSidebarOpen, toggleSidebar]);

    return (
        <div className={`sidebar ${isMobile ? 'mobile' : ''} ${isSidebarOpen ? 'open' : ''}`}>
            <div className="main-content">
                <div className="sidebar-item" onClick={(e) => navigate("/addfashion")}>Add Fashion</div>
                <div className="sidebar-item" onClick={(e) => navigate("/addfood")}>Add Food</div>
                <div className="sidebar-item" onClick={(e) => navigate("/addjewelry")}>Add Jewelry</div>
                <div className="sidebar-item">View Orders</div>
            </div>
        </div>
    );
};

export default Sidebar;