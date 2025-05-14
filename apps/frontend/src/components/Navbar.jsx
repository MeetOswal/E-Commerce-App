import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";
import "./Navbar.css";
import axios from "axios";
const Navbar = ({ fromPage, isLoggedIn }) => {
  const [isClicked, setIsClicked] = useState(false);
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth > 1150);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const dropdownRef = useRef(null);

  // Sub-categories data
  const subCategories = {
    Fashion: ["Elegant", "Hip and Fly", "Active Wear", "Lingerie"],
    Food: ["Jams", "Spreads", "Honey"],
    Jewelry: ["Rings", "Necklaces", "Earrings"],
  };

  const navItems = ["Fashion", "Food", "Jewelry", "Pricing", "Contact"];

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 1000);
      if (window.innerWidth > 1000) {
        setSidebarOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      const isDropdownItem = event.target.closest('.dropdown-item, .mobile-dropdown-item');
      
      const isSidebarItem = event.target.closest('.sidebar-item');
  
      if (sidebarRef.current && 
          !sidebarRef.current.contains(event.target) &&
          !isSidebarItem) {
        setSidebarOpen(false);
      }
      
      if (dropdownRef.current && 
          !dropdownRef.current.contains(event.target) &&
          !isDropdownItem) {
        setActiveDropdown(null);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNavigation = async() => {
    if (fromPage === "accountPage" && isLoggedIn) {
      //handle logout
      try {
        const response = await axios.post(
          "https://xuujlvb9tj.execute-api.us-east-1.amazonaws.com/api/logout",
          {},
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          // console.log("Logout successful");
          window.location.reload();
        }
      } catch (error) {
          console.log(error);
          navigate("/account")
      }
    }else{
      navigate(fromPage === "accountPage" ? "/" : "/account");
    }
    
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    setActiveDropdown(null);
  };

  const toggleDropdown = (item, event) => {
    if (event) event.stopPropagation();
    if (activeDropdown === item) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(item);
    }
  };

  const handleDropdownCategoryClick = (subItem) => {
    
    const formattedSubItem = subItem.toLowerCase().replace(/\s+/g, '-');
    navigate(`/category/${formattedSubItem}`);
    setActiveDropdown(null);
    setSidebarOpen(false);
  };

  const handleCategoryClick = (item, event) => {
    if (item === "Pricing") {
      navigate("/pricing");
      setSidebarOpen(false);
    } else if (item === "Contact") {
      navigate("/contact");
      setSidebarOpen(false);
    } else {
      toggleDropdown(item, event);
    }
  };
  
  return (
    <>
      <nav className="navbar">
        <div className="navbar-grid">
          {isWideScreen ? (
            <>
              <div className="brand-container" onClick={(e) => navigate("/")}>
                <img src={logo} alt="Market Logo" className="navbar-logo" />
                <span className="brand-name">Rtisanal Market</span>
              </div>
              {navItems.map((item, index) => (
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
                    <div className="dropdown-container" ref={dropdownRef}>
                      <span
                        className="nav-item dropdown-trigger"
                        onClick={(e) => toggleDropdown(item, e)}
                        style={{ cursor: "pointer" }}
                      >
                        {item}
                      </span>
                      {activeDropdown === item && (
                        <div className="dropdown-menu">
                          {subCategories[item]?.map((subItem, subIndex) => (
                            <div
                              key={subIndex}
                              className="dropdown-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log("Clicked subitem:", subItem);
                                handleDropdownCategoryClick(subItem);
                              }}
                            >
                              {subItem}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="hamburger-col">
                <button className="hamburger-button" onClick={toggleSidebar}>
                  ☰
                </button>
              </div>
              <div onClick={(e) => navigate("/")} className="brand-container">
                <img src={logo} alt="Market Logo" className="navbar-logo" />
                <span className="brand-name">Rtisanal Market</span>
              </div>
            </>
          )}

          <div className="button-col">
            <button
              className={`home-button ${
                isClicked
                  ? "clicked"
                  : fromPage === "landingPage"
                  ? "blinking"
                  : ""
              }`}
              onClick={handleNavigation}
              onMouseDown={() => setIsClicked(true)}
              onMouseUp={() => setIsClicked(false)}
              onMouseLeave={() => setIsClicked(false)}
            >
              {fromPage === "accountPage" ? (isLoggedIn ? "Logout" : "Home") : isLoggedIn ? "Account" : "Sign In"}
            </button> 
          </div>
        </div>
      </nav>

      {/* Right Sidebar */}
      <div
        className={`sidebar right ${sidebarOpen ? "open" : ""}`}
        ref={sidebarRef}
      >
        <div className="sidebar-content">
          {navItems.map((item, index) => (
            <div key={index} className="sidebar-item">
              {item === "Pricing" || item === "Contact" ? (
                <span
                  onClick={(e) => handleCategoryClick(item, e)}
                  style={{ cursor: "pointer" }}
                >
                  {item}
                </span>
              ) : (
                <div className="mobile-dropdown-container">
                  <div
                    onClick={(e) => handleCategoryClick(item, e)}
                    style={{ cursor: "pointer" }}
                  >
                    {item}
                  </div>
                  {activeDropdown === item && (
                    <div className="mobile-dropdown-menu">
                      {subCategories[item]?.map((subItem, subIndex) => (
                        <div
                          key={subIndex}
                          className="mobile-dropdown-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDropdownCategoryClick(subItem);
                          }}
                        >
                          {subItem}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => {
            setSidebarOpen(false);
            setActiveDropdown(null);
          }}
        />
      )}
    </>
  );
};

export default Navbar;
