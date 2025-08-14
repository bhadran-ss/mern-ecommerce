import React from "react";
import bg from "/bg.jpg";
import delivery from "/icons/delivery.png";
import coin from "/icons/coin.png";
import chat from "/icons/chat.png";
import jeans from "/jeans.webp";
import shirts from "/shirts.jpg";
import suits from "/suits.jpg";
import bags from "/bags.jpg";
import jackets from "/jackets.jpg";
import shoes from "/shoes.jpeg";
import TopPicks from "../components/TopPicks";
import CategoriesSection from "../components/CategoriesSection";

const HomePage = () => {
  const categories = [
    { name: "Jeans", image: jeans },
    { name: "Shirts", image: shirts },
    { name: "Suits", image: suits },
    { name: "Bags", image: bags },
    { name: "Jackets", image: jackets },
    { name: "Shoes", image: shoes },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div
        className="relative h-[90vh] w-full bg-cover bg-center flex items-center justify-center text-white"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="text-center">
          <h1 className="text-6xl font-bold">2019</h1>
          <h2 className="text-5xl font-light mb-8">Lookbook.</h2>
          <button className="px-6 py-2 border border-white text-white rounded-full hover:bg-white hover:text-black transition">
            SEE MORE
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 py-16 px-4 text-center">
        <div>
          <img src={delivery} alt="Free Shipping" className="mx-auto h-16 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Free shipping</h3>
          <p className="text-gray-600">
            Fusce urna quam, euismod sit amet mollis quis, vestibulum quis
            velit.
          </p>
        </div>
        <div>
          <img src={coin} alt="Money Back" className="mx-auto h-16 mb-4" />
          <h3 className="text-xl font-semibold mb-2">100% Money back</h3>
          <p className="text-gray-600">
            Euismod sit amet mollis quis, vestibulum quis velit.
          </p>
        </div>
        <div>
          <img src={chat} alt="Support" className="mx-auto h-16 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Online support 24/7</h3>
          <p className="text-gray-600">
            Vesti bulum malesuada aliquet libero viverra cursus.
          </p>
        </div>
      </div>

      {/* Top Picks */}
      <TopPicks />

      {/* Categories */}
      <CategoriesSection categories={categories} />
    </div>
  );
};

export default HomePage;
