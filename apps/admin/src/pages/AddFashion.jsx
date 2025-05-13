import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/SideBar";
import axios from "axios";
import "./AddFashion.css"; // Import the CSS file

const AddFashion = () => {
  const fileInputRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [itemData, setItemData] = useState({
    title: "",
    description: "",
    seller: "",
    category: "",
    itemStatus: "active",
    price: "",
    photos: [],
    sizes: [""],
    color: [""],
  });

  useEffect(() => {
    const chechAuth = async () => {
      try {
        const response = await axios.get(
          "https://naom0qtxma.execute-api.us-east-1.amazonaws.com/api/check-auth",
          {
            withCredentials: true,
          }
        );
        console.log(response.data);
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
        navigate("/");
        console.error("Error fetching data:", error);
      }
    };

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 650);
      // Close sidebar when resizing to mobile
      if (window.innerWidth <= 650) {
        setIsSidebarOpen(false);
      }
    };

    chechAuth();
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, [navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItemData({ ...itemData, [name]: value });
  };

  const handleFileChange = (files) => {
    if (!files) return;
    
    const newPhotos = Array.from(files); // Convert FileList to array
    setItemData({
      ...itemData,
      photos: [...itemData.photos, ...newPhotos], // Add new files to existing ones
    });
  };

  const removeImage = (index) => {
    const newPhotos = [...itemData.photos];
    newPhotos.splice(index, 1);
    setItemData({
      ...itemData,
      photos: newPhotos,
    });
  }

  // Add a new size field
  const addSize = () => {
    setItemData({
      ...itemData,
      sizes: [...itemData.sizes, ""],
    });
  };

  // Remove a size field by index
  const removeSize = (index) => {
    const newSizes = [...itemData.sizes];
    newSizes.splice(index, 1);
    setItemData({
      ...itemData,
      sizes: newSizes,
    });
  };

  // Handle change for a specific size input
  const handleSizeChange = (index, value) => {
    const newSizes = [...itemData.sizes];
    newSizes[index] = value;
    setItemData({
      ...itemData,
      sizes: newSizes,
    });
  };

  const addColor = () => {
    setItemData({
      ...itemData,
      color: [...itemData.color, ""],
    });
  };

  // Remove a size field by index
  const removeColor = (index) => {
    const newColor = [...itemData.color];
    newColor.splice(index, 1);
    setItemData({
      ...itemData,
      color: newColor,
    });
  };

  // Handle change for a specific size input
  const handleColorChange = (index, value) => {
    const newColors = [...itemData.color];
    newColors[index] = value;
    setItemData({
      ...itemData,
      color: newColors,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
  
    // Filter out empty sizes
    const nonEmptySizes = itemData.sizes.filter((size) => size.trim() !== "");
    const nonEmptyColors = itemData.sizes.filter((color) => color.trim() !== "");
  
    if (nonEmptySizes.length === 0) {
      setSubmitting(false);
      alert("Please add at least one size.");
      return;
    }
    
    if (nonEmptyColors.length === 0) {
      setSubmitting(false);
      alert("Please add at least one color.");
      return;
    }
    // Check if at least one photo is uploaded
    if (itemData.photos.length === 0) {
      setSubmitting(false);
      alert("Please upload at least one image.");
      return;
    }
  
    try {
      // Function to convert image file to base64 string using async/await
      const convertToBase64 = async (file) => {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };
  
      // Convert all photos to base64
      const photosBase64 = await Promise.all(
        itemData.photos.map(async (photo) => {
          if (photo instanceof File) {
            return await convertToBase64(photo);
          }
          return photo; // In case it's already base64
        })
      );
  
      // Prepare the data to be sent in the POST request
      const requestData = {
        title: itemData.title,
        description: itemData.description,
        seller: itemData.seller,
        category: itemData.category.toLowerCase(),
        itemStatus: itemData.itemStatus,
        price: itemData.price,
        photos: photosBase64, // Now sending an array of photos
        attributes: [
          { attribute : 'size',
            values : nonEmptySizes
          },
          {attribute : 'color',
            values : itemData.color}
        ]
      };
      
      const response = await axios.post(
        "https://naom0qtxma.execute-api.us-east-1.amazonaws.com/api/additem",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log(requestData);

      if (response.status === 200) {
        alert("Item added successfully!");
        console.log("Item added successfully:", response.data.message);
        setItemData({
          title: "",
          description: "",
          seller: "",
          category: "",
          itemStatus: "active",
          price: "",
          photos: [], // Reset to empty array
          sizes: [""],
          color: [""],
        });
      } else {
        alert("Failed to add item. Please try again.");
        console.error("Failed to add item:", response.statusText);
      }
    } catch (error) {
      error.response?.data
        ? alert(error.response.data.message)
        : alert("An error occurred. Please try again.");
      console.error("Error in request:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-item-container">
      <Navbar isLoggedIn={isLoggedIn} toggleSidebar={toggleSidebar} />
      <Sidebar
        isMobile={isMobile}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <h1 className="add-item-title">Add New Fashion Item</h1>
      <form onSubmit={handleSubmit} className="add-item-form">
        <div className="add-item-form-group">
          <label className="add-item-label">Item Title:</label>
          <input
            className="add-item-input"
            type="text"
            name="title"
            value={itemData.title}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="add-item-form-group">
          <label className="add-item-label">Item Description:</label>
          <textarea
            className="add-item-textarea"
            name="description"
            value={itemData.description}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="add-item-form-group">
          <label className="add-item-label">Category:</label>
          <input
            className="add-item-input"
            type="text"
            name="category"
            value={itemData.category}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="add-item-form-group">
          <label className="add-item-label">Seller:</label>
          <input
            className="add-item-input"
            type="text"
            name="seller"
            value={itemData.seller}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="add-item-form-group">
          <label className="add-item-label">Price:</label>
          <input
            className="add-item-input"
            type="number"
            name="price"
            step="0.01"
            pattern="^\d+(\.\d{1,2})?$"
            value={itemData.price}
            onChange={handleInputChange}
            required
            min={0}
          />
        </div>
        <div className="add-item-form-group-file">
          <label className="add-file-label">Images:</label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e.target.files)}
            multiple // Allow multiple file selection
            style={{ display: "none" }}
          />
          <button
            type="button"
            className="add-item-input-file"
            onClick={handleButtonClick}
          >
            Upload Images
          </button>
          {itemData.photos.length > 0 && (
            <div className="uploaded-images-container">
              {itemData.photos.map((photo, index) => (
                <div key={index} className="uploaded-image">
                  <span>{photo.name}</span>
                  <button
                    type="button"
                    className="remove-image-button"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sizes-section">
          <h3 className="variant-title">Sizes</h3>
          <div className="size-fields-container">
            {itemData.sizes.map((size, index) => (
              <div key={index} className="size-input-wrapper">
                <input
                  className="add-item-input size-input"
                  type="text"
                  value={size}
                  onChange={(e) => handleSizeChange(index, e.target.value)}
                  required
                  placeholder="e.g., S, M, L"
                />
                {itemData.sizes.length > 1 && (
                  <button
                    className="remove-size-button"
                    type="button"
                    onClick={() => removeSize(index)}
                    title="Remove size"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            className="add-button"
            type="button"
            onClick={addSize}
            style={{ marginTop: "10px" }}
          >
            + Add Size
          </button>
        </div>

        <div className="sizes-section">
          <h3 className="variant-title">Color</h3>
          <div className="size-fields-container">
            {itemData.color.map((color, index) => (
              <div key={index} className="size-input-wrapper">
                <input
                  className="add-item-input size-input"
                  type="text"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  required
                  placeholder="e.g., Blue, Red, Green"
                />
                {itemData.color.length > 1 && (
                  <button
                    className="remove-size-button"
                    type="button"
                    onClick={() => removeColor(index)}
                    title="Remove size"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            className="add-button"
            type="button"
            onClick={addColor}
            style={{ marginTop: "10px" }}
          >
            + Add Color
          </button>
        </div>
        <div className="submit-button-container">
          <button type="submit" className="submit-button" disabled={submitting}>
            {submitting ? "Sending..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFashion;
