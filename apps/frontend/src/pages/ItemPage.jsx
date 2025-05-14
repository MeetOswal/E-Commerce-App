import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ItemPage.css";
import Navbar from "../components/Navbar";

const ItemPage = () => {
  const { name: itemId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [buttonClicked, setButtonClicked] = useState(false);
  useEffect(() => {
    const chechAuth = async () => {
      try {
        const response = await axios.get(
          "https://xuujlvb9tj.execute-api.us-east-1.amazonaws.com/api/check-auth",
          { withCredentials: true }
        );
        console.log(response.data);
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
        console.error("Error fetching data:", error);
      }
    };

    const fetchItemDetails = async () => {
      try {
        const response = await axios.get(
          `https://xuujlvb9tj.execute-api.us-east-1.amazonaws.com/api/get-item?itemId=${itemId}`,
          { withCredentials: true }
        );
        console.log(response);

        setItem(response.data.item);
        if (response.data.item.photos.length > 0) {
          setMainImage(response.data.item.photos[0]);
        }

        // Initialize selected attributes with the first option for each attribute
        const initialSelections = {};
        Object.entries(response.data.item.attributes).forEach(
          ([category, values]) => {
            if (values.length > 0) {
              initialSelections[category] = values[0];
            }
          }
        );
        setSelectedAttributes(initialSelections);

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch item details");
        setLoading(false);
      }
    };

    chechAuth();
    fetchItemDetails();
  }, [itemId]);

  const handleAttributeSelect = (category, value) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleAddToCart = async () => {
    try {
      if (!isLoggedIn) {
        alert("Please LogIn First");
        return;
      }
      setButtonClicked(true);
      const requestData = {
        item_id: itemId, 
        attributes: selectedAttributes,
      };

      // Add JWT token to headers if needed (assuming token is stored in cookies)
      const response = await axios.post(
        "https://xuujlvb9tj.execute-api.us-east-1.amazonaws.com/api/add-to-cart", // Add your actual API endpoint
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            // Add Authorization header if not using cookies:
            // "Authorization": `Bearer ${yourJwtToken}`
          },
          withCredentials: true, // Only needed if using cookies for auth
        }
      );

      if (response.status === 200) {
        alert("Item added to cart successfully!");
        // Consider better user feedback than alert(), like a toast notification
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      alert(`Error: ${error.response?.data?.error || error.message}`);
      // More user-friendly error handling:
      // setError(error.response?.data?.error || "Failed to add item to cart");
    } finally {
      setButtonClicked(false);
    }
  };

  if (loading) {
    return (
      <div className="item-page-container">
        <div className="loading">Loading item details...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!item) {
    return <div className="not-found">Item not found</div>;
  }

  return (
    <>
      <Navbar fromPage={"itemPage"} isLoggedIn={isLoggedIn} />
      <div className="item-page-container">
        <div className="item-page">
          <div className="item-header">
            <h1>{item.title}</h1>
            <div className="item-meta">
              <span className="item-status">{item.status}</span>
              <span className="item-posted">
                Posted: {formatDate(item.createdAt)}
              </span>
            </div>
          </div>

          <div className="item-content">
            <div className="item-gallery">
              {mainImage && (
                <div className="main-image">
                  <img src={mainImage.url} alt={item.title} />
                </div>
              )}
              {item.photos.length > 1 && (
                <div className="thumbnail-container">
                  {item.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className={`thumbnail ${
                        mainImage?.id === photo.id ? "active" : ""
                      }`}
                      onClick={() => setMainImage(photo)}
                    >
                      <img src={photo.url} alt={`${item.title} thumbnail`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="item-details">
              <div className="price-section">
                <h2>{formatPrice(item.price)}</h2>
              </div>

              <div className="seller-section">
                <h3>Seller Information</h3>
                <p>{item.seller}</p>
              </div>

              <div className="description-section">
                <h3>Description</h3>
                <p>{item.description}</p>
              </div>

              <div className="attributes-section">
                <h3>Details</h3>
                <div className="attribute-categories">
                  {Object.entries(item.attributes).map(([category, values]) => (
                    <div key={category} className="attribute-category">
                      <h4>{category}</h4>
                      <div className="attribute-options">
                        {values.map((value) => (
                          <button
                            key={value}
                            className={`attribute-option ${
                              selectedAttributes[category] === value
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              handleAttributeSelect(category, value)
                            }
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="action-buttons">
                <button
                  className="item-page-add-to-cart"
                  onClick={(e) => handleAddToCart()}
                >
                  Add To Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ItemPage;
