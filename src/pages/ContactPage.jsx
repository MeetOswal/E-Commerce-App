import React from 'react';
import Navbar from '../components/Navbar';
import './ContactPage.css';

const ContactPage = () => {

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const subject = form.subject.value;
    const message = form.message.value;
    
    const mailtoLink = `mailto:osw.meet00@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\n\nMessage: ${message}`)}`;
    window.open(mailtoLink, "_blank");
    form.reset();
  };

  return (
    <div className="contact-page">
      <Navbar fromPage="registerPage"/>
      <div className="contact-container">
        <h1 className="contact-title">Have A Question? Send Us A Message</h1>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="text" 
              id="name" 
              name="name"
              placeholder='Name' 
              required 
              className="gold-input"
            />
          </div>
          <div className="form-group">
            <input 
              type="text" 
              id="subject" 
              name="subject" 
              placeholder='Subject'
              required 
              className="gold-input"
            />
          </div>
          <div className="form-group">
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