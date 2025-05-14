import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar.jsx";
import ItemCard from "../components/ItemCard.jsx";
import "./CategoryPage.css";
import { useNavigate } from "react-router-dom";

const CategoryPage = () => {
  const { name } = useParams();
  const categoryName = name.replace(/-/g, " ");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate()
  const [pagination, setPagination] = useState({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 50,
    });

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
    const fetchItems = async () => {
      try {
        
        const response = await axios.get(
          `https://xuujlvb9tj.execute-api.us-east-1.amazonaws.com/api/get-category?category=${categoryName}`,
          {
            params: {
              page: pagination.currentPage,
            },
            withCredentials: true,
          }
        );
        console.log(response);
        
        setItems(response.data.items);
        setPagination(response.data.pagination);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch items");
        setLoading(false);
        console.error("Error fetching items:", err);
      }
    };
    fetchItems();
    chechAuth();
    
  }, [categoryName]);

  if (loading)
    return (
      <div className="category-page">
        <div className="loading-container">
        <h2>Loading....</h2>
      </div>
      </div>
    );
  if (error || items.length === 0)
    return (
      <div>
        <Navbar fromPage="categoryPage" isLoggedIn={isLoggedIn}/>
        <div className="category-page">
          <h2 className="no-item-error">No Item Found</h2>
        </div>
      </div>
    );
  return (
    <div>
      <Navbar fromPage="categoryPage" isLoggedIn={isLoggedIn}/>
      <div className="category-page">
        <div className="items-container">
          {items.map((item) => (
            <div key={item.itemId}>
              <ItemCard {...item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
