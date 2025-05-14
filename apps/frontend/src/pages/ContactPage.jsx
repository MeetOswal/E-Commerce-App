import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import './ContactPage.css';
import axios from 'axios';
const ContactPage = () => {
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
        console.log(response.data);
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
        console.error("Error fetching data:", error);
      }
    };
    chechAuth();
  }, [])
  const handleSubmit = (e) => {
    e.preventDefault();
    const recipient = "rtisanalservice@rtisanalmarket.com"; 
    const form = e.target;
    const name = form.name.value;
    const subject = form.subject.value;
    const message = form.message.value;
    
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\n\nMessage: ${message}`)}`;
    window.open(mailtoLink, "_blank");
    form.reset();
  };

  return (
    <div className="contact-page">
      <Navbar fromPage="contactPage" isLoggedIn = {isLoggedIn}/>
      <div className="contact-container">
        <h1 className="contact-title">Have A Question? Send Us A Message</h1>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-form-group">
            <input 
              type="text" 
              id="name" 
              name="name"
              placeholder='Name' 
              required 
              className="gold-input"
            />  
          </div>
          <div className="contact-form-group">
            <input 
              type="text" 
              id="subject" 
              name="subject" 
              placeholder='Subject'
              required 
              className="gold-input"
            />
          </div>
          <div className="contact-form-group">
            <textarea 
              id="message" 
              name="message" 
              rows="5" 
              placeholder='Message'
              required 
              className="gold-input"
            ></textarea>
          </div>
          <button type="submit" className="submit-btn">Send</button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;