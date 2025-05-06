import React from "react";
import "./VerticalCarousel.css";
import img1 from "../assets/img1.png";
import img2 from "../assets/img2.png";
import img3 from "../assets/img3.png";
import img4 from "../assets/img4.png";
import img5 from "../assets/img5.png";
import img6 from "../assets/img6.png";
import img7 from "../assets/img7.png";
import img8 from "../assets/img8.png";
import img9 from "../assets/img9.png";
import img10 from "../assets/img10.png";
import img11 from "../assets/img11.png";
import img12 from "../assets/img12.png";
import img13 from "../assets/img13.png";

export default function VerticalCarousel() {
  const items = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12, img13];
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
