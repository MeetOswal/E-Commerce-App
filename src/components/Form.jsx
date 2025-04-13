import React, {useState, useEffect} from 'react';
import './Form.css';

const HendecagonForm = ({ selectedPlan }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    category: "",
    email: "",
    telephone: "",
    pricingCategory: "",
  });

  useEffect(() => {
    if (selectedPlan) {
      setFormData({...formData, ['pricingCategory'] : selectedPlan})
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const recipient = "rtisanalservice@rtisanalmarket.com";

    const body = `First Name: ${encodeURIComponent(formData.firstName)}
      %0ALast Name: ${encodeURIComponent(formData.lastName)}
      %0ACompany Name: ${encodeURIComponent(formData.companyName)}
      %0ACategory: ${encodeURIComponent(formData.category)}
      %0AEmail: ${encodeURIComponent(formData.email)}
      %0ATelephone: ${encodeURIComponent(formData.telephone)}
      %0APricing Category: ${encodeURIComponent(formData.pricingCategory)}
    `;

    const mailtoLink = `mailto:${recipient}?subject=New Form Submission&body=${body}`;

    window.open(mailtoLink, "_blank");
  };

  return (
    <div className="form-wrapper">
      <h1 className="form-title">Register to Grow Your Business with Us</h1>
      <div className="form-container">
        <form className="form" onSubmit={handleSubmit}>
          <div className="name-fields">
            <input type="text" name='firstName' placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
            <input type="text" name='lastName' placeholder="Last Name" value={formData.lastName} onChange={handleChange} required/>
          </div>
          
          <input type="text" name='companyName' placeholder="Company Name" value={formData.companyName} onChange={handleChange} required />
          
          <select name='category' className="form-select" value={formData.category} onChange={handleChange} required>
            <option value="">Select Category</option>
            <option value="art">Art</option>
            <option value="beverages">Beverages</option>
            <option value="clothing">Clothing</option>
            <option value="food">Food</option>
            <option value="jewelry">Jewelry</option>
            <option value="furniture">Furniture</option>
            <option value="pottery">Pottery</option>
            <option value="soap">Soap</option>
          </select>
          
          <input name='email' type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
          <input name='telephone' type="tel" placeholder="Telephone" value={formData.telephone} onChange={ handleChange} required/>
          
          <select name = 'pricingCategory' className="form-select" value={formData.pricingCategory} onChange={handleChange} required>
            <option value="">Pricing Category</option>
            <option value="Monthly Plan">Monthly</option>
            <option value="Annual Plan">Annually</option>
            <option value="Pay As You Go">Pay as You Go</option>
          </select>
          
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default HendecagonForm;