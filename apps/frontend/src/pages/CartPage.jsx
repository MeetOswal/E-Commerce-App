import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CartPage.css"; // You'll need to create this CSS file
import axios from "axios";
import Navbar from "../components/Navbar";
const CartPage = () => {
  const [cart, setCart] = useState({
    items : [],
    total : 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate();


  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(
          `https://xuujlvb9tj.execute-api.us-east-1.amazonaws.com/api/get-cart`,
          {
            withCredentials: true,
          }
        );

        setCart(response.data);
        setIsLoggedIn(true)
      } catch (err) {
        console.error("Error fetching cart:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
    setLoading(false);
  }, []);

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const requestData = {
        cart_item_id: cartItemId,
        quantity: newQuantity,
      };
      const response = await axios.patch(
        "https://xuujlvb9tj.execute-api.us-east-1.amazonaws.com/api/update-cart-item",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setCart((prevData) => {
          const updatedItems = prevData.items.map((item) =>
            item.cartItemId === cartItemId
              ? { ...item, quantity: newQuantity }
              : item
          );

          const updatedTotal = updatedItems.reduce(
            (sum, item) => sum + parseFloat(item.price) * item.quantity,
            0
          );

          return {
            ...prevData,
            items: updatedItems,
            total: updatedTotal,
          };
        });
      }
    } catch (err) {
      alert("Error updating quantity:", err);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      const response = await axios.delete('https://xuujlvb9tj.execute-api.us-east-1.amazonaws.com//api/remove-from-cart', {
        data: { cart_item_id: cartItemId },
        withCredentials: true
      });
  
      if (response.status === 200) {
        // Remove the item from the cart state and recalculate total
        setCart(prevCart => {
          const updatedItems = prevCart.items.filter(item => item.cartItemId !== cartItemId);
          
          const newTotal = updatedItems.reduce(
            (sum, item) => sum + item.price * item.quantity, 0
          );
          
          return {
            items: updatedItems,
            total: Math.round(newTotal * 100) / 100 // Round to 2 decimal places
          };
        });
      }
    } catch (err) {
      console.error("Error removing item:", err);
      // Optional: Show error message to user
    }
  };
  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (loading) {
    return <div className="cart-loading">Loading your cart...</div>;
  }

  if (error) {
    return <div className="cart-error">Error: {error}</div>;
  }

  return (
    <div className="cart-page">
    <Navbar fromPage={'cartPage'} isLoggedIn={isLoggedIn}/>
    <div className="cart-container">
        
      <h1>Your Shopping Cart</h1>
      <div className="cart-items">
        {cart.items.length > 0 ? cart.items.map((item) => (
          <div key={item.cartItemId} className="cart-item">
            <div className="item-image">
              <img
                src={item.photo || "/placeholder-product.jpg"}
                alt={item.title}
                onClick={() => navigate(`/item/${item.itemId}`)}
              />
            </div>
            <div className="item-details">
              <h3 onClick={() => navigate(`/item/${item.itemId}`)}>
                {item.title}
              </h3>

              {Object.keys(item.attributes).length > 0 && (
                <div className="item-attributes">
                  {Object.entries(item.attributes).map(([key, value]) => (
                    <div key={key} className="attribute">
                      <span className="attribute-key">{key}: </span>
                      <span className="attribute-value">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="item-price">
                ${parseFloat(item.price).toFixed(2)}
              </div>

              <div className="item-quantity">
                <button
                  onClick={() =>
                    handleQuantityChange(item.cartItemId, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() =>
                    handleQuantityChange(item.cartItemId, item.quantity + 1)
                  }
                >
                  +
                </button>
              </div>

              <div className="item-subtotal">
                Subtotal: ${(item.price * item.quantity).toFixed(2)}
              </div>

              <button
                onClick={() => handleRemoveItem(item.cartItemId)}
                className="remove-item"
              >
                Remove
              </button>
            </div>
          </div>
        )) : (
            <div className="cart-empty">
        <h2>Your Cart is Empty</h2>
        <button onClick={() => navigate("/")} className="continue-shopping">
          Continue Shopping
        </button>
      </div>
        )}
      </div>

      <div className="cart-summary">
        <div className="total-amount">
          <h3>Total: ${parseFloat(cart.total).toFixed(2)}</h3>
        </div>
        <button onClick={handleCheckout} className="checkout-button">
          Proceed to Checkout
        </button>
      </div>
    </div>
    </div>
  );
};

export default CartPage;
