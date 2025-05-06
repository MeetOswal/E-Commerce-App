// PricingPage.js (updated)
import React from "react";
import Navbar from "../components/Navbar";
import "./PricingPage.css";
import SubscriptionCard from "../components/SubscriptionCard";

const PricingPage = () => {
  return (
    <div className="pricing-page">
      <Navbar fromPage="registerPage" />
      
      <div className="pricing-content">
        {/* First Row - Title */}
        <div className="pricing-title-row">
          <h1 className="pricing-title">Pricing</h1>
          <p className="pricing-subtitle">
            Flexible pricing for every stage of your journey — get started today
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