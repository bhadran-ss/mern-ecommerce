// src/pages/AboutPage.jsx
import React from "react";

const AboutPage = () => {
  return (
    <div className="px-6 md:px-20 py-16 bg-white min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">About Us</h1>
      <div className="max-w-3xl mx-auto text-lg text-gray-700 space-y-6">
        <p>
          Welcome to our store! We are passionate about fashion and committed to providing high-quality, stylish products to our customers.
        </p>
        <p>
          Our journey started in 2019 with the vision of making fashion more accessible. We offer a wide range of products, including jeans, shirts, suits, bags, jackets, and shoes.
        </p>
        <p>
          We believe in customer satisfaction and back our products with top-notch service, fast delivery, and a 100% money-back guarantee.
        </p>
        <p>
          Thank you for being part of our community!
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
