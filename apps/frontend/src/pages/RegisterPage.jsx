import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './RegisterPage.css';
import Navbar from '../components/Navbar';
import HendecagonForm from '../components/Form';

const RegisterPage = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false)
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
  }, [])
  const pricingCategory = location.state?.pricingCategory || "";
  return (
    <div className="register-page">
        <Navbar fromPage="registerPage" isLoggedIn={isLoggedIn}/>
        <div className="form-wrapper">
            <HendecagonForm selectedPlan={pricingCategory} />
        </div>
    </div>
  );
};

export default RegisterPage;