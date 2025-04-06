import React from "react";
import svgImage from "../assets/Black.svg" // Update this path
import "./Contact.css";

const Contact = () => {
    return (
      <div className="svg-with-overlay">
        <img src={svgImage} alt="" className="svg-background"/>
        
        <div className="svg-overlay-text">
          <h3 className="gold-text">Pricing</h3>
          <p><b>$25</b> / Month</p>
          <p><b>$240</b> / Year <b>(20% Discount)</b></p>
          
          <div className="text-gap"></div>
          
          <p><b>$0.75</b> / item featured per week</p>
          <p><b>$0.25</b> / credit card transaction</p>
          
          <div className="text-gap"></div>
          
          <h3 className="gold-text">Contact Us</h3>
          <p><b>Email:</b> rtisanalservice@rtisanalmarket.com</p>
        </div>
      </div>
    );
  };

export default Contact;