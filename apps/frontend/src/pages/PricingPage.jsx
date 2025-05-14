// PricingPage.js (updated)
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "./PricingPage.css";
import SubscriptionCard from "../components/SubscriptionCard";
import axios from "axios";
const PricingPage = () => {
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
  },[])

  return (
    <div className="pricing-page">
      <Navbar fromPage="pricingPage" isLoggedIn={isLoggedIn}/>
      
      <div className="pricing-content">
        {/* First Row - Title */}
        <div className="pricing-title-row">
          <h1 className="pricing-title">Pricing</h1>
          <p className="pricing-subtitle">
            Want to sell your products? Choose a plan that suits you best!
          </p>
        </div>

        {/* Second Row - Cards */}
        <div className="pricing-container">
          <SubscriptionCard
            title="Monthly Plan"
            price="$25"
            priceDescription="per month"
          />
          <SubscriptionCard
            title="Annual Plan"
            discountText="20% Discount Over Monthly Plan"
            price="$240"
            priceDescription="per year"
          />
          <SubscriptionCard
            title="Pay As You Go"
            price="$0.75"
            priceDescription="per item featured per week"
          />
        </div>

        {/* Third Row - Note */}
        <div className="pricing-note-row">
          <p className="pricing-note">
            * Additional $0.25 per credit card transaction applies to all payments
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;