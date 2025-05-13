import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/SideBar";
import axios from "axios";
import "./AddItem.css"; // Import the CSS file
const AddItem = () => {
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
    variants: [
      {
        price: "",
        quantity: "",
        photo: null,
        variantStatus: "active",
        attributes: [
          {
            attrCategory: "default",
            categoryValue: "default",
          },
        ],
      },
    ],
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

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...itemData.variants];
    updatedVariants[index][field] = value;
    setItemData({ ...itemData, variants: updatedVariants });
  };

  const handleOptionChange = (variantIndex, optionIndex, field, value) => {
    const updatedVariants = itemData.variants.map((variant, vIndex) => {
      const updatedOptions = [...variant.attributes];

      if (field === "attrCategory") {
        // Apply category change to all variants at the same option index
        if (updatedOptions[optionIndex]) {
          updatedOptions[optionIndex] = {
            ...updatedOptions[optionIndex],
            [field]: value,
          };
        }
      } else if (vIndex === variantIndex) {
        // Apply other field changes only to the targeted variant
        if (updatedOptions[optionIndex]) {
          updatedOptions[optionIndex] = {
            ...updatedOptions[optionIndex],
            [field]: value,
          };
        }
      }

      return { ...variant, attributes: updatedOptions };
    });

    setItemData({ ...itemData, variants: updatedVariants });
  };

  const addVariant = () => {
    const lastVariant = itemData.variants[itemData.variants.length - 1];
    const newOptions = lastVariant
      ? [...lastVariant.attributes]
      : [{ attrCategory: "default", categoryValue: "default" }];
    setItemData({
      ...itemData,
      variants: [
        ...itemData.variants,
        {
          price: "",
          quantity: "",
          photo: null,
          variantStatus: "active",
          attributes: newOptions,
        },
      ],
    });
  };

  const removeVariant = (variantIndex) => {
    const updatedVariants = itemData.variants.filter(
      (_, index) => index !== variantIndex
    );
    setItemData({ ...itemData, variants: updatedVariants });
  };

  const addOption = () => {
    const newOption = { attrCategory: "default", categoryValue: "default" };

    const updatedVariants = itemData.variants.map((variant) => ({
      ...variant,
      attributes: [...variant.attributes, newOption],
    }));

    setItemData({ ...itemData, variants: updatedVariants });
  };

  const removeOption = (optionIndex) => {
    const updatedVariants = itemData.variants.map((variant) => ({
      ...variant,
      attributes: variant.attributes.filter(
        (_, index) => index !== optionIndex
      ),
    }));

    setItemData({ ...itemData, variants: updatedVariants });
  };

  const handleFileChange = (index, file) => {
    const updatedVariants = [...itemData.variants];
    updatedVariants[index].photo = file;
    setItemData({ ...itemData, variants: updatedVariants });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if all variants have a photo
    setSubmitting(true);
    const hasAllVariantsWithPhoto = itemData.variants.every(
      (variant) => variant.photo !== null && variant.photo !== ""
    );

    if (!hasAllVariantsWithPhoto) {
      setSubmitting(false);
      alert("All variants must have an image.");
      return; // Exit early if any variant is missing a photo
    }

    // Function to convert image file to base64 string using async/await
    const convertToBase64 = async (file) => {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(",")[1]); // Get base64 after the comma
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    // Update each variant's photo to be base64 encoded if it's a file input
    const updatedVariants = [];
    for (const variant of itemData.variants) {
      if (variant.photo instanceof File) {
        try {
          const base64Photo = await convertToBase64(variant.photo);
          updatedVariants.push({ ...variant, photo: base64Photo });
        } catch (error) {
          console.error("Error converting image to base64:", error);
        }
      } else {
        updatedVariants.push(variant); // If the photo is already in base64, no conversion needed
      }
    }

    // Prepare the data to be sent in the POST request
    const requestData = {
      title: itemData.title,
      description: itemData.description,
      seller: itemData.seller,
      category: itemData.category.toLowerCase(),
      itemStatus: itemData.itemStatus,
      variants: updatedVariants,
    };

    // Send the data to the AWS API Gateway endpoint
    try {
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

      if (response.status === 200) {
        alert("Item added successfully!");
        console.log("Item added successfully:", response.data.message);
        setItemData({
          title: "",
          description: "",
          seller: "",
          category: "",
          itemStatus: "active",
          variants: [
            {
              price: "",
              quantity: "",
              photo: null,
              variantStatus: "active",
              attributes: [
                {
                  attrCategory: "default",
                  categoryValue: "default",
                },
              ],
            },
          ],
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
    }finally {
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
      <h1 className="add-item-title">Add New Item</h1>
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
        <div>
          <h3 className="variant-title">Variants</h3>
          {itemData.variants.map((variant, variantIndex) => (
            <div
              key={variantIndex}
              style={{
                marginBottom: "20px",
                border: "4px solid #ccc",
                padding: "10px",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h4>Variant {variantIndex + 1}</h4>
                {variantIndex > 0 && (
                  <button
                    className="remove-button"
                    type="button"
                    onClick={() => removeVariant(variantIndex)}
                    style={{ marginLeft: "10px" }}
                  >
                    Remove Variant
                  </button>
                )}
              </div>
              <div className="add-item-form-group">
                <label className="add-item-label">Price:</label>
                <input
                  className="add-item-input"
                  type="number"
                  step="0.01"
                   pattern="^\d+(\.\d{1,2})?$"
                  value={variant.price}
                  onChange={(e) =>
                    handleVariantChange(variantIndex, "price", e.target.value)
                  }
                  required
                  min={0}
                />
              </div>
              <div className="add-item-form-group">
                <label className="add-item-label">Quantity:</label>
                <input
                  className="add-item-input"
                  type="number"
                  value={variant.quantity}
                  onChange={(e) =>
                    handleVariantChange(
                      variantIndex,
                      "quantity",
                      e.target.value
                    )
                  }
                  required
                  min={1}
                />
              </div>
              <div className="add-item-form-group-file">
                <label className="add-file-label">Image (JPEG):</label>

                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) =>
                    handleFileChange(variantIndex, e.target.files[0])
                  }
                  style={{ display: "none" }}
                />

                {/* Custom-styled button */}
                <button
                  type="button"
                  className="add-item-input-file"
                  onClick={handleButtonClick}
                >
                  Upload
                </button>
              </div>
              <div>
                <h4 className="option-title">Options</h4>
                {variant.attributes.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    style={{
                      marginBottom: "10px",
                      border: "3px solid #ccc",
                      padding: "5px",
                      borderRadius: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h4>Option {optionIndex + 1}</h4>
                      {optionIndex > 0 && variantIndex === 0 && (
                        <button
                          className="remove-button"
                          type="button"
                          onClick={() =>
                            removeOption(variantIndex, optionIndex)
                          }
                          style={{ marginLeft: "10px" }}
                        >
                          Remove Option
                        </button>
                      )}
                    </div>
                    <div className="add-item-form-group">
                      <label className="add-item-label">Category:</label>
                      <input
                        disabled={variantIndex !== 0}
                        className="add-item-input"
                        type="text"
                        value={option.attrCategory}
                        onChange={(e) =>
                          handleOptionChange(
                            variantIndex,
                            optionIndex,
                            "attrCategory",
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                    <div className="add-item-form-group">
                      <label className="add-item-label">Value:</label>
                      <input
                        className="add-item-input"
                        type="text"
                        value={option.categoryValue}
                        onChange={(e) =>
                          handleOptionChange(
                            variantIndex,
                            optionIndex,
                            "categoryValue",
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                  </div>
                ))}
                {variantIndex === 0 && (
                  <button
                    className="add-button"
                    type="button"
                    onClick={() => addOption(variantIndex)}
                    style={{ marginTop: "10px" }}
                  >
                    Add Option
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            className="add-button"
            type="button"
            onClick={addVariant}
            style={{ marginTop: "20px" }}
          >
            Add Variant
          </button>
        </div>
        <div className="submit-button-container">
          <button type="submit" className="submit-button">
          {submitting ? 'Sending' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddItem;
