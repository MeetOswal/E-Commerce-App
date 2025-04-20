import React, { useState, useEffect } from "react";
import './LandingPage.css';
import Navbar from "../components/Navbar";
import Title from "../components/Title"
import Wheel from "../components/Wheel";
import AutoCarousel from "../components/VerticalCarousel";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [isShortScreen, setIsShortScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsShortScreen(window.innerHeight < 650);
    };

    // Check on mount and on resize
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  return (
    <div className={`landing-page ${isShortScreen ? 'short-screen' : ''}`}>
      <div className="page-content">
        <AutoCarousel />
        <Navbar fromPage="landingPage"/>
        <Title/>
        {/* <Contact/> */}
        <Wheel />
      </div>
      <div className="copyright">
        &copy; 2025 Rtisanal Markets, LLC
      </div>
    </div>
  );
};

export default LandingPage;