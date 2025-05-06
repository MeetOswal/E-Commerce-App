import React, { useState, useEffect } from "react";
import "./Title.css";
import imageSrc from "../assets/Polygon1.png";
import logo from "../assets/Logo2.png";

const QuadrantImage = () => {
  const texts = [
    "Roll Out Your Products For The World To Buy",
    "Making Money Isn't A Dream, It's Here",
    "Your Competitive Edge Is Here",
    "Easier Discoverability",
    "Lower Fees ",
    "Unified Commerce"
  ];

  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [logoVisible, setLogoVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const launchDate = new Date("2025-05-15T00:00:00");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = launchDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    const textInterval = setInterval(() => {
      setCurrentTextIndex((prevIndex) =>
        prevIndex === texts.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    const logoInterval = setInterval(() => {
      setLogoVisible(false);
      setTimeout(() => {
        setLogoVisible(true);
      }, 200);
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(textInterval);
      clearInterval(logoInterval);
    };
  }, []);

  return (
    <div className="positioned-image-container">
      <img src={imageSrc} alt="Positioned image" className="positioned-image" />
      <div className="text-banner">
        <div className="countdown-section">
          <div className="countdown-title">COUNTDOWN TO LAUNCH</div>
          <div className="countdown-timer">
            {timeLeft.days}d : {timeLeft.hours}h : {timeLeft.minutes}m :{" "}
            {timeLeft.seconds}s
          </div>
        </div>
        <div className="text-content">
        <div className="text-wrapper">
            <div className="rotating-text" key={currentTextIndex}>
              {texts[currentTextIndex]}
            </div>
          </div>
          <div
            className={`logo-container ${logoVisible ? "visible" : "hidden"}`}
          >
            <img src={logo} alt="Logo" className="dissolving-logo" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuadrantImage;
