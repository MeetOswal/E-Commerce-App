import React from "react";
import "./VerticalCarousel.css";
import img1 from "../assets/img1.png";
import img2 from "../assets/img2.png";
import img3 from "../assets/img3.png";
import img4 from "../assets/img4.png";
import img5 from "../assets/img5.png";
import img6 from "../assets/img6.png";
import img7 from "../assets/img7.png";

const items = [img1, img2, img3, img4, img5, img6, img7];

export default function VerticalCarousel() {
  return (
    <div className="vertical-carousel-container">
      <div className="vertical-carousel-track">
        {[...items, ...items].map((img, index) => (
          <div className="vertical-carousel-card" key={index}>
          <img src={img} alt={`Item ${index}`} className="card-image" />
          <div className="card-text">Popular Product</div>
        </div>
        ))}
      </div>
    </div>
  );
}
