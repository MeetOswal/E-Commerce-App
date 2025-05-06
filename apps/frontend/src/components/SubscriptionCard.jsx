import React from "react";
import "./SubscriptionCard.css"; // We'll create this CSS file next
import { useNavigate } from "react-router-dom";
const SubscriptionCard = ({
  title,
  discountText,
  price,
  priceDescription,
}) => {

  const navigate = useNavigate();
  const handleChoosePlan = () => {
    navigate('/register', { state: { pricingCategory: title } });
  };

  return (
    <div className="subscription-card">
      <h2 className="card-title">{title}</h2>
      <p className="discount-text">{discountText}</p>
      <p className="price">{price}</p>
      <p className="price-description">{priceDescription}</p>
      <button className="choose-plan-btn" onClick={handleChoosePlan}>Choose Plan</button>
    </div>
  );
};

export default SubscriptionCard;