import { connectDB, disconnectDB } from "./lib/db.js";
import Category from "./models/category.model.js";
import Product from "./models/product.model.js";
import User from "./models/user.model.js";
import config from "./config/env.js";
import { slugifyCategory } from "./utils/category.js";

const legacySampleImageIdByName = new Map([
  ["Vintage Blue Jeans", "photo-1520962911512-1b8beb440f4e"],
  ["Soft Cotton Shirt", "photo-1521572163474-6864f9cf17ab"],
  ["Leather Messenger Bag", "photo-1490367532201-b9bc1dc483f6"],
  ["Running Sneakers", "photo-1519741497252-27287287ca0c"],
  ["Aviator Sunglasses", "photo-1522335789203-aabd1fc54bc9"],
  ["Denim Jacket", "photo-1512436991641-6745cdb1723f"],
  ["Leather Boots", "photo-1519741497252-27287287ca0c"],
  ["Wireless Headphones", "photo-1511367461989-f85a21fda167"],
  ["Slim Fit Chinos", "photo-1512436991641-6745cdb1723f"],
  ["Elegant Dress Watch", "photo-1519741497252-27287287ca0c"],
  ["Travel Backpack", "photo-1506617420156-8e4536971650"],
  ["Performance Hoodie", "photo-1523381213563-6a3bb3fdd814"],
  ["Minimalist Wallet", "photo-1524499982521-1ffd58dd89ea"],
  ["Premium Graphic Tee", "photo-1521572163474-6864f9cf17ab"],
]);

const sampleProducts = [
  {
    name: "Vintage Blue Jeans",
    description: "Classic blue denim jeans in a versatile everyday cut.",
    price: 2199,
    category: "Jeans",
    stock: 25,
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Blue Patterned Shirt",
    description: "A blue button-up shirt with a subtle all-over pattern.",
    price: 1499,
    category: "Shirts",
    stock: 40,
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Structured Shoulder Bag",
    description: "A structured shoulder bag with a top handle and long strap.",
    price: 3599,
    category: "Bags",
    stock: 15,
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Red Running Sneakers",
    description: "Red low-top running sneakers with a streamlined profile.",
    price: 2799,
    category: "Shoes",
    stock: 32,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Round Sunglasses",
    description: "Round metal-frame sunglasses with dark lenses.",
    price: 1299,
    category: "Accessories",
    stock: 45,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Denim Jacket",
    description: "A dark denim jacket with a contrast collar and button front.",
    price: 2699,
    category: "Jackets",
    stock: 26,
    image:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Brown Lace-Up Boots",
    description: "Brown lace-up boots with a classic ankle-height profile.",
    price: 4299,
    category: "Shoes",
    stock: 20,
    image:
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Wireless Headphones",
    description: "Black over-ear headphones with a padded headband.",
    price: 5699,
    category: "Electronics",
    stock: 30,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Khaki Chino Trousers",
    description: "Khaki chinos with a clean, tapered everyday silhouette.",
    price: 1899,
    category: "Pants",
    stock: 33,
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Minimalist Wristwatch",
    description:
      "A minimalist wristwatch with a light dial and leather-tone strap.",
    price: 3999,
    category: "Accessories",
    stock: 27,
    image:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Navy Daypack",
    description: "A navy backpack with a front zip pocket and top handle.",
    price: 2499,
    category: "Bags",
    stock: 35,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Gray Pullover Hoodie",
    description: "A gray pullover hoodie with a relaxed shape.",
    price: 1699,
    category: "Hoodies",
    stock: 29,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Brown Leather Wallet",
    description: "A slim brown fold-over wallet with a simple design.",
    price: 999,
    category: "Accessories",
    stock: 74,
    image:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Classic Crew T-Shirt",
    description: "A short-sleeve crew-neck T-shirt with a relaxed fit.",
    price: 999,
    category: "Tops",
    stock: 60,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    ],
  },
];

const categoryArtworkByName = new Map([
  ["Jeans", "/category-images/jeans.jpg"],
  ["Shirts", "/category-images/shirts.jpg"],
  ["Bags", "/category-images/bags.jpg"],
  ["Shoes", "/category-images/shoes.jpg"],
  ["Jackets", "/category-images/jackets.jpg"],
  ["Accessories", "/category-images/accessories.jpg"],
  ["Electronics", "/category-images/electronics.jpg"],
  ["Pants", "/category-images/pants.jpg"],
  ["Hoodies", "/category-images/hoodies.jpg"],
  ["Tops", "/category-images/tops.jpg"],
]);

const legacyCategoryArtworkByName = new Map([
  ["Jeans", ["/jeans.webp"]],
  ["Shirts", ["/shirts.jpg"]],
  ["Bags", ["/bags.jpg"]],
  ["Shoes", ["/shoes.jpeg"]],
  ["Jackets", ["/jackets.jpg"]],
  [
    "Accessories",
    [
      sampleProducts.find(({ name }) => name === "Round Sunglasses").image,
    ],
  ],
  [
    "Electronics",
    [
      sampleProducts.find(({ name }) => name === "Wireless Headphones").image,
    ],
  ],
  [
    "Pants",
    [
      sampleProducts.find(({ name }) => name === "Khaki Chino Trousers").image,
    ],
  ],
  [
    "Hoodies",
    [
      sampleProducts.find(({ name }) => name === "Gray Pullover Hoodie").image,
    ],
  ],
  [
    "Tops",
    [
      sampleProducts.find(({ name }) => name === "Classic Crew T-Shirt").image,
    ],
  ],
]);

const sampleCategories = [
  ...new Set(sampleProducts.map(({ category }) => category)),
].map((name) => {
  const image = categoryArtworkByName.get(name);
  if (!image) {
    throw new Error(`Missing seed artwork for category "${name}".`);
  }

  return {
    name,
    slug: slugifyCategory(name),
    description: `Explore our ${name.toLowerCase()} collection.`,
    image,
    isActive: true,
  };
});

const getImageId = (url) => {
  try {
    return new URL(url).pathname.split("/").pop();
  } catch {
    return null;
  }
};

const legacyProductNames = {
  "Blue Patterned Shirt": "Soft Cotton Shirt",
  "Structured Shoulder Bag": "Leather Messenger Bag",
  "Red Running Sneakers": "Running Sneakers",
  "Round Sunglasses": "Aviator Sunglasses",
  "Brown Lace-Up Boots": "Leather Boots",
  "Khaki Chino Trousers": "Slim Fit Chinos",
  "Minimalist Wristwatch": "Elegant Dress Watch",
  "Navy Daypack": "Travel Backpack",
  "Gray Pullover Hoodie": "Performance Hoodie",
  "Brown Leather Wallet": "Minimalist Wallet",
  "Classic Crew T-Shirt": "Premium Graphic Tee",
};

const seedProducts = async () => {
  if (config.NODE_ENV === "production") {
    console.error("Sample data seeding is disabled when NODE_ENV=production.");
    process.exitCode = 1;
    return;
  }

  try {
    await connectDB();

    const seller = await User.findOne({ role: "seller" }).select("_id").lean();
    if (!seller) {
      console.error(
        "No seller account exists. Create a seller account, then run the seed command again.",
      );
      process.exitCode = 1;
      return;
    }

    const categoryResult = await Category.bulkWrite(
      sampleCategories.map((category) => ({
        updateOne: {
          filter: { slug: category.slug },
          update: { $setOnInsert: category },
          upsert: true,
        },
      })),
      { ordered: true },
    );
    await Category.bulkWrite(
      sampleCategories.map((category) => ({
        updateOne: {
          filter: {
            slug: category.slug,
            image: {
              $in: [
                "",
                ...(legacyCategoryArtworkByName.get(category.name) ?? []),
              ],
            },
          },
          update: { $set: { image: category.image } },
        },
      })),
      { ordered: true },
    );

    const productNames = sampleProducts
      .flatMap(({ name }) => [name, legacyProductNames[name]])
      .filter(Boolean);
    const existingProducts = await Product.find({
      sellerId: seller._id,
      name: { $in: productNames },
    })
      .select("_id name image")
      .lean();
    const existingByName = new Map(
      existingProducts.map((product) => [product.name, product]),
    );
    const operations = [];
    let preservedCount = 0;

    for (const product of sampleProducts) {
      const legacyName = legacyProductNames[product.name];
      const existing =
        existingByName.get(product.name) ||
        existingByName.get(legacyName);
      if (!existing) {
        operations.push({
          updateOne: {
            filter: { name: product.name, sellerId: seller._id },
            update: { $setOnInsert: { ...product, sellerId: seller._id } },
            upsert: true,
          },
        });
        continue;
      }

      const legacyImageId = legacySampleImageIdByName.get(existing.name);
      if (legacyImageId !== getImageId(existing.image)) {
        preservedCount += 1;
        continue;
      }

      operations.push({
        updateOne: {
          filter: {
            _id: existing._id,
            name: existing.name,
            image: existing.image,
          },
          update: {
            $set: {
              name: product.name,
              description: product.description,
              category: product.category,
              image: product.image,
              images: product.images,
            },
          },
        },
      });
    }

    const result = operations.length
      ? await Product.bulkWrite(operations, { ordered: true })
      : { upsertedCount: 0, modifiedCount: 0 };

    console.log(
      `Seed complete: ${categoryResult.upsertedCount} categories added; ${result.upsertedCount} products added, ${result.modifiedCount} legacy images refreshed, ${preservedCount} seller-edited products preserved.`,
    );
  } catch (error) {
    console.error(
      "Seed failed. Check that MongoDB is running, MONGO_URI is configured, and product data is valid.",
    );
    process.exitCode = 1;
  } finally {
    try {
      await disconnectDB();
    } catch {
      console.error("Could not close the MongoDB connection cleanly.");
      process.exitCode = 1;
    }
  }
};

seedProducts();
