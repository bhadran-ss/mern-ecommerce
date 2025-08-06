import React from "react";
import { useNavigate } from "react-router-dom";

const CategoriesSection = ({ categories }) => {
  const navigate = useNavigate();

  return (
    <div className="px-6 md:px-20 py-16 bg-gray-50 text-center">
      <h1 className="text-3xl md:text-4xl font-semibold mb-10">
        Shop by Category
      </h1>
      <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat, index) => (
          <div
            key={index}
            onClick={() => navigate(`/category/${cat.name.toLowerCase()}`)}
            className="bg-white rounded-lg shadow hover:shadow-lg cursor-pointer p-4 transition"
          >
            <div className="aspect-square mb-4 overflow-hidden rounded-md">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <p className="text-lg font-medium text-gray-800">
              {cat.name} <span className="ml-1">→</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesSection;
