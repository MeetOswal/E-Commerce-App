import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Accounts.css";
import axios from "axios";
const Accounts = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    telephone: "",
    email: "",
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    // Simulate authentication check

    const chechAuth = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          "https://xuujlvb9tj.execute-api.us-east-1.amazonaws.com/api/get-profile",
          {
            withCredentials: true,
          }
        );
        console.log(response.data);
        setIsLoggedIn(true);
        setUserData((prevData) => ({
          ...prevData,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          telephone: response.data.telephone,
          email: response.data.email,
        }));
      } catch (error) {
        setIsLoggedIn(false);
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    chechAuth();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setButtonClicked(true);
      const response = await axios.post(
        "https://xuujlvb9tj.execute-api.us-east-1.amazonaws.com/api/login",
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        console.log("Login successful");
        navigate("/");
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.log(error);

      alert("Login failed. Please check your credentials.");
    } finally {
      setButtonClicked(false);
    }
  };

  if (isLoading) {
    return (
      <div className="accounts-page">
        <Navbar fromPage="accountPage" isLoggedIn={isLoggedIn} />
        <div className="loading-container">
          <h2>Loading....</h2>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="accounts-page">
        <Navbar fromPage="accountPage" isLoggedIn={isLoggedIn} />
        <div className="accounts-container">
          <div className="login-card">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="login-submit-btn">
                {buttonClicked ? "Sending" : "Login"}
              </button>
              <p className="signup-link-container">
                No Account,{" "}
                <a href="/signup" className="signup-link">
                  Sign up
                </a>
              </p>
            </form>
          </div>

          <div className="seller-card">
            <h2>Want to Sell Your Products?</h2>
            <button
              onClick={(e) => navigate("/pricing")}
              className="seller-btn"
            >
              Click Here
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="accounts-page">
      <Navbar fromPage="accountPage" isLoggedIn={isLoggedIn} />

      <div className={`loggedin-container`}>
        <div className="welcome-message">
          <h1>Welcome to Your Account</h1>
        </div>

        <div className="user-info" style={{ color: "#222", marginTop: "20px" }}>
          <div className="info-row">
            <span className="info-label">Email: </span>
            <span className="info-value">{userData.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">First Name: </span>
            <span className="info-value">{userData.firstName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Last Name: </span>
            <span className="info-value">{userData.lastName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Telephone: </span>
            <span className="info-value">{userData.telephone}</span>
          </div>
          <div className="info-row">
            <button
              onClick={() => navigate("/cart")}
              className="account-page-cart-btn"
            >
              View Cart
            </button>
          </div>
        </div>
      </div>

      <footer className="seller-footer">
        <div className="footer-content">
          <span>Want to sell your products? Check our </span>
          <a href="/pricing" className="plans-link">
            Plans
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Accounts;
