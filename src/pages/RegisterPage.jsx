import React from 'react';
import { Link } from 'react-router-dom';
import './RegisterPage.css';
import Navbar from '../components/Navbar';
import HendecagonForm from '../components/Form';

const RegisterPage = () => {
  return (
    <div className="register-page">
        <Navbar fromPage="registerPage"/>
        <div className="form-wrapper">
            <HendecagonForm />
        </div>
    </div>
  );
};

export default RegisterPage;