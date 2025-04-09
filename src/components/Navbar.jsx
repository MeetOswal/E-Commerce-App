import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";
import "./Navbar.css";

const Navbar = ({ fromPage }) => {
  const [isClicked, setIsClicked] = useState(false);
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth > 1150);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 1150);
      if (window.innerWidth > 1150) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    "Art",
    "Beverages",
    "Clothing",
    "Fragrances",
    "Food",
    "Furniture",
    "Jewelry",
    "Kitchenware",
    "Pricing",
    "Contact",
  ];

  const handleNavigation = () => {
    navigate(fromPage === "registerPage" ? "/" : "/register");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-grid">
          <div className="brand-container">
            <img src={logo} alt="Market Logo" className="navbar-logo" />
            <span className="brand-name">Rtisanal Market</span>
          </div>

          {isWideScreen ? (
            navItems.map((item, index) => (
              <div key={index} className="navbar-col">
                {item === "Pricing" ? (
                  <span
                    className="nav-item"
                    onClick={() => navigate("/pricing")}
                    style={{ cursor: "pointer" }}
                  >
                    {item}
                  </span>
                ) : item === "Contact" ? (
                  <span
                    className="nav-item"
                    onClick={() => navigate("/contact")}
                    style={{ cursor: "pointer" }}
                  >
                    {item}
                  </span>
                ) : (
                  <span className="nav-item">{item}</span>
                )}
              </div>
            ))
          ) : (
            <div className="hamburger-col">
              <button className="hamburger-button" onClick={toggleSidebar}>
                ☰
              </button>
            </div>
          )}

          <div className="button-col">
            <button
              className={`home-button ${
                isClicked
                  ? "clicked"
                  : fromPage === "registerPage"
                  ? ""
                  : "blinking"
              }`}
              onClick={handleNavigation}
              onMouseDown={() => setIsClicked(true)}
              onMouseUp={() => setIsClicked(false)}
              onMouseLeave={() => setIsClicked(false)}
            >
              {fromPage === "registerPage" ? "Home" : "Register"}
            </button>
          </div>
        </div>
      </nav>

      {/* Right Sidebar */}
      <div className={`sidebar right ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-content">
          {navItems.map((item, index) => (
            <div key={index} className="sidebar-item" onClick={toggleSidebar}>
              {item === "Pricing" ? (
                <span
                  onClick={() => navigate("/pricing")}
                  style={{ cursor: "pointer" }}
                >
                  {item}
                </span>
              ) : item === "Contact" ? (
                <span
                  onClick={() => navigate("/contact")}
                  style={{ cursor: "pointer" }}
                >
                  {item}
                </span>
              ) : (
                <span>{item}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar} />
      )}
    </>
  );
};

export default Navbar;
