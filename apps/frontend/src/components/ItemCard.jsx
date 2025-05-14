import React from "react";
import "./ItemCard.css";
import { useNavigate } from "react-router-dom";

const ItemCard = ({ itemId, title, price, photo }) => {
  const navigate = useNavigate();
  
  return (
    <div className="item-card">
      <img
        src={photo}
        alt={title}
        className="item-card__image"
      />
      <div className="item-card__content">
        <p className="item-card__title">{title}</p>
        <p className="item-card__price">{price}</p>
      </div>
      <button 
        className="item-card__button" 
        onClick={(e) => navigate(`/item/${itemId}`)}
      >
        View Details
      </button>
    </div>
  );
};

export default ItemCard;