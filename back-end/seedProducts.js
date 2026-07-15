import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import "./lib/db.js";
import Product from "./models/product.model.js";
import User from "./models/user.model.js";

dotenv.config({ silent: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sampleProducts = [
  {
    name: "Vintage Blue Jeans",
    description:
      "Classic slim-fit denim with subtle distressing for everyday style.",
    price: 2199,
    category: "Jeans",
    stock: 25,
    image:
      "https://images.unsplash.com/photo-1520962911512-1b8beb440f4e?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1520962911512-1b8beb440f4e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520974736068-4cd68691f0e5?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Soft Cotton Shirt",
    description:
      "Breathable cotton shirt with a modern tailored fit and crisp finish.",
    price: 1499,
    category: "Shirts",
    stock: 40,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Leather Messenger Bag",
    description:
      "Smooth leather bag with adjustable strap and roomy interior compartments.",
    price: 3599,
    category: "Bags",
    stock: 15,
    image:
      "https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1490367532201-08f627ca0a85?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Running Sneakers",
    description:
      "Lightweight performance sneakers designed for comfort and style.",
    price: 2799,
    category: "Shoes",
    stock: 32,
    image:
      "https://images.unsplash.com/photo-1519741497252-27287287ca0c?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1519741497252-27287287ca0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1528701800489-20c0d9b51b36?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Classic Wool Coat",
    description:
      "Warm wool blend coat finished with a refined, structured silhouette.",
    price: 4999,
    category: "Jackets",
    stock: 18,
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512436991641-55ef96274d0a?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Smartwatch Pro",
    description:
      "Feature-packed smartwatch with activity tracking and long battery life.",
    price: 6999,
    category: "Electronics",
    stock: 22,
    image:
      "https://images.unsplash.com/photo-1503435824048-a7997123d3d2?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1503435824048-a7997123d3d2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Aviator Sunglasses",
    description:
      "Timeless aviator sunglasses with UV protection and polished metal frames.",
    price: 1299,
    category: "Accessories",
    stock: 45,
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518546305929-5c9d96cd8f4b?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Denim Jacket",
    description:
      "Versatile denim jacket with a soft interior and classic button front.",
    price: 2699,
    category: "Jackets",
    stock: 26,
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Leather Boots",
    description:
      "Durable leather boots built for everyday wear with comfort padding.",
    price: 4299,
    category: "Shoes",
    stock: 20,
    image:
      "https://images.unsplash.com/photo-1519741497252-27287287ca0c?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1519741497252-27287287ca0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1528701800489-20c0d9b51b36?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Wireless Headphones",
    description:
      "Noise-cancelling headphones with crisp audio and comfortable ear cups.",
    price: 5699,
    category: "Electronics",
    stock: 30,
    image:
      "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Classic Leather Belt",
    description:
      "Smooth leather belt with a sleek matte buckle for everyday style.",
    price: 799,
    category: "Accessories",
    stock: 58,
    image:
      "https://images.unsplash.com/photo-1524499982521-1ffd58dd89ea?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1524499982521-1ffd58dd89ea?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Slim Fit Chinos",
    description:
      "Comfort stretch chinos with a refined silhouette for day-to-night wear.",
    price: 1899,
    category: "Pants",
    stock: 33,
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Elegant Dress Watch",
    description:
      "Minimalist watch with leather strap and polished dial for formal occasions.",
    price: 3999,
    category: "Accessories",
    stock: 27,
    image:
      "https://images.unsplash.com/photo-1519741497252-27287287ca0c?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1519741497252-27287287ca0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503435824048-a7997123d3d2?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Travel Backpack",
    description:
      "Rugged travel backpack with laptop pocket and water-resistant exterior.",
    price: 2499,
    category: "Bags",
    stock: 35,
    image:
      "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1498034532784-0df75727cd21?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Performance Hoodie",
    description: "Soft hoodie with moisture-wicking fabric and a relaxed fit.",
    price: 1699,
    category: "Hoodies",
    stock: 29,
    image:
      "https://images.unsplash.com/photo-1523381213563-6a3bb3fdd814?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1523381213563-6a3bb3fdd814?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520974736068-4cd68691f0e5?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Casual Polo Shirt",
    description:
      "Breathable modal polo shirt with a refined collar and lasting comfort.",
    price: 1399,
    category: "Shirts",
    stock: 50,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Classic Wool Scarf",
    description: "Soft wool scarf with a timeless design for cooler weather.",
    price: 899,
    category: "Accessories",
    stock: 65,
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524499982521-1ffd58dd89ea?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Wireless Charger",
    description:
      "Fast wireless charging pad compatible with the latest smartphones.",
    price: 1199,
    category: "Electronics",
    stock: 38,
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Patchwork Denim Shirt",
    description:
      "Unique patchwork denim shirt with a relaxed cut and detailed stitching.",
    price: 2299,
    category: "Shirts",
    stock: 22,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Tactical Field Jacket",
    description:
      "Rugged field jacket with multiple pockets and water-resistant fabric.",
    price: 4499,
    category: "Jackets",
    stock: 19,
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Urban Crossbody Bag",
    description:
      "Lightweight crossbody bag perfect for city travel and essential storage.",
    price: 1899,
    category: "Bags",
    stock: 41,
    image:
      "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1498034532784-0df75727cd21?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Travel Duffel Bag",
    description:
      "Spacious duffel bag with durable straps and a separate shoe compartment.",
    price: 3299,
    category: "Bags",
    stock: 17,
    image:
      "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1498034532784-0df75727cd21?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Minimalist Wallet",
    description:
      "Slim wallet with RFID protection and premium vegetable-tanned leather.",
    price: 999,
    category: "Accessories",
    stock: 74,
    image:
      "https://images.unsplash.com/photo-1524499982521-1ffd58dd89ea?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1524499982521-1ffd58dd89ea?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Premium Graphic Tee",
    description:
      "Soft jersey tee with bold graphic print and a relaxed silhouette.",
    price: 999,
    category: "Tops",
    stock: 60,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    ],
  },
];

const createSeller = async () => {
  const sellerEmail = "seller@demo.com";
  let seller = await User.findOne({ email: sellerEmail });
  if (!seller) {
    seller = new User({
      name: "Demo Seller",
      email: sellerEmail,
      password: "password123",
      role: "seller",
    });
    await seller.save();
    console.log("Created seller user:", sellerEmail);
  }
  return seller;
};

const seedProducts = async () => {
  try {
    const seller = await createSeller();

    const existingCount = await Product.countDocuments();
    if (existingCount >= sampleProducts.length) {
      console.log(
        `Database already contains ${existingCount} products. Seed skipped.`,
      );
      process.exit(0);
    }

    await Product.deleteMany({});
    const productDocs = sampleProducts.map((product) => ({
      ...product,
      sellerId: seller._id,
    }));
    await Product.create(productDocs);
    console.log(`Seeded ${productDocs.length} products successfully.`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seedProducts();
