import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './RegisterPage.css';
import Navbar from '../components/Navbar';
import HendecagonForm from '../components/Form';

const RegisterPage = () => {
  const location = useLocation();
  const pricingCategory = location.state?.pricingCategory || "";
  return (
    <div className="register-page">
        <Navbar fromPage="registerPage"/>
        <div className="form-wrapper">
            <HendecagonForm selectedPlan={pricingCategory} />
        </div>
    </div>
  );
};

export default RegisterPage;