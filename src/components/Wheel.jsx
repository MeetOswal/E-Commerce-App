import React, { useState, useEffect } from "react";
import "./Wheel.css";
import image1 from "../assets/Intersect1.svg";
import image2 from "../assets/Intersect2.svg";
import image3 from "../assets/Intersect3.svg";
import image4 from "../assets/Intersect4.svg";
import altimage1 from "../assets/Intersect5.svg";
import altimage2 from "../assets/Intersect6.svg";
import altimage3 from "../assets/Intersect7.svg";
import altimage4 from "../assets/Intersect8.svg";

const Wheel = () => {

  const [isTallScreen, setIsTallScreen] = useState(false);
  const heightBreakpoint = 1350;

  const [showAltImage, setShowAltImage] = useState([
    false,
    false,
    false,
    false,
  ]);

  useEffect(() => {
    const checkHeight = () => {
      setIsTallScreen(window.innerWidth >= heightBreakpoint && window.innerHeight >= 900);
    };

    // Initial check
    checkHeight();

    // Add resize listener
    window.addEventListener('resize', checkHeight);
    return () => window.removeEventListener('resize', checkHeight);
  }, []);

  const size = isTallScreen ? 800 : 640;
  const thickness = isTallScreen ? 320 : 250;
  const offset = isTallScreen ? 80 : 50;
  const circleSize = isTallScreen ? 230 : 180;

  const totalTime = 16000; // 16s for a full rotation
  const updateInterval = totalTime / 4; // 4 positions
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setShowAltImage(prev => {
        const newImages = [...prev];
        newImages[index] = !newImages[index];
        return newImages;
      });
      index = (index + 1) % 4;
    }, updateInterval);
  
    return () => clearInterval(interval);
  }, []);

  const wheelStyle = {
    position : 'relative',
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "50%",
    border: `${thickness}px solid #DAA520`,
    boxSizing: "border-box",
    background: "transparent",
    display : 'flex',
    justifyContent: "center",
    alignItems: "center",
    animation: "rotateWheel 16s linear infinite",
    transformOrigin: "center center",
  };

  const radius = size / 2;
  const circleBaseStyle = {
    position: "absolute",
    width: `${circleSize}px`,
    height: `${circleSize}px`,
    borderRadius: "50%",
    border: "5px solid #440C86",
    animation: "counterRotate 16s linear infinite",
    transformOrigin: "center center",
  };

  return (
    <div className="golden-wheel-container">
      <div style={wheelStyle}>
        <div
          style={{
            ...circleBaseStyle,
            top: `${-thickness/2}px`,
            left: "50%",

          }}
        >
          <img
            src={showAltImage[2] ? altimage1 : image1}
            alt="Decoration 1"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        <div
          style={{
            ...circleBaseStyle,
            top: "50%",
            left: `${-thickness/2}px`,
            // backgroundColor: 'red',
          }}
        >
          <img
            src={showAltImage[1] ? altimage2 : image2}
            alt="Decoration 1"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        <div
          style={{
            ...circleBaseStyle,
            top: `${radius - offset}px`,
            left: "50%"
          }}
        >
          <img
            src={showAltImage[0] ? altimage3 : image3}
            alt="Decoration 1"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        <div
          style={{
            ...circleBaseStyle,
            top: "50%",
            left: `${radius - offset}px`
          }}
        >
          <img
            src={showAltImage[3] ? altimage4 : image4}
            alt="Decoration 1"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Wheel;
