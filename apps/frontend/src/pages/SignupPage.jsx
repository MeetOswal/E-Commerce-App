import React, { useEffect, useState } from "react";
import "./SignupPage.css";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const UserForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    telephone: "",
  });

  const [buttonClicked, setButtonClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate();

  useEffect(() => {
    const chechAuth = async () => {
      try {
        const response = await axios.get(
          "https://xuujlvb9tj.execute-api.us-east-1.amazonaws.com/api/check-auth",
          {
            withCredentials: true,
          }
        );
        navigate("/")
      } catch (error) {
      }finally{
        setIsLoading(false)
      }
    };
    chechAuth();
  }, [])
  
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    // Basic phone validation - accepts numbers, +, -, spaces, parentheses
    // Adjust this regex based on your requirements
    const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
    return re.test(phone) && phone.replace(/[^0-9]/g, '').length >= 8;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
        [name]: value,
    }));
    }

const handleSubmit = async(e) => {
    e.preventDefault();
    setButtonClicked(true);

    // Email validation
    if (!validateEmail(formData.email)) {
      alert('Please enter a valid email address');
      return
    }

    // Phone validation
    if (!validatePhone(formData.telephone)) {
      alert('Please enter a valid phone number');
      return
    }
    try {
        const response = await axios.post('https://xuujlvb9tj.execute-api.us-east-1.amazonaws.com/api/create-user', formData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if(response.status === 201) {
          alert('User created successfully');
          setFormData({
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            telephone: "",
          });
          navigate("/account");
        }
        
    } catch (error) {
        alert('Error creating user: ' + error?.response ? error.response.data.message : error.message);
    }finally {
        setButtonClicked(false);
    }
    // If all validations pass
  };

  if (isLoading) {
    return (
      <div className="accounts-page">
        <Navbar fromPage="accountPage" />
        <div className="loading-container">
          <h2>Loading....</h2>
        </div>
      </div>
    );
  }

  
  return (
    <div className="signup-page">
        <Navbar fromPage="signupPage" />
      <div className="form-wrapper">
        <h1 className="form-title">Create Account</h1>
        <div className="form-container">
          <form className="form" onSubmit={handleSubmit}>
            <div className="name-fields">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => handleChange(e)}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange(e)}
                required
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleChange(e)}
              required
            />
            <input
              type="tel"
              name="telephone"
              placeholder="Telephone"
              value={formData.telephone}
              onChange={(e) => handleChange(e)}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleChange(e)}
              required
              minLength="8"
            />
            <button type="submit" >
              {buttonClicked ? "Sending..." : "Sumbit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
