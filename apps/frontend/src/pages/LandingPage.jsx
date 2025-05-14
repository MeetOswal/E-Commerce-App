import React, { useState, useEffect } from "react";
import './LandingPage.css';
import Navbar from "../components/Navbar";
import Title from "../components/Title"
import Wheel from "../components/Wheel";
import AutoCarousel from "../components/VerticalCarousel";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const LandingPage = () => {
  const [isShortScreen, setIsShortScreen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const chechAuth = async () => {
      try {
        const response = await axios.get(
          "https://xuujlvb9tj.execute-api.us-east-1.amazonaws.com/api/check-auth",
          {
            withCredentials: true,
          }
        );
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };
    chechAuth();
    const checkScreenSize = () => {
      setIsShortScreen(window.innerHeight < 640);
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
        <Navbar fromPage="landingPage" isLoggedIn = {isLoggedIn}/>
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