import assert from "node:assert/strict";
import test from "node:test";

import mongoose from "mongoose";

import Category from "../back-end/models/category.model.js";
import Product, {
  PRODUCT_STATUSES,
} from "../back-end/models/product.model.js";

const identifiers = Object.freeze({
  category: new mongoose.Types.ObjectId(),
  seller: new mongoose.Types.ObjectId(),
});

const validProductAttributes = () => ({
  name: "  Everyday Cotton Shirt  ",
  description: "  A comfortable everyday shirt.  ",
  brand: "  Example Brand  ",
  category: identifiers.category,
  seller: identifiers.seller,
  status: "active",
  tags: [" Summer ", "summer", "Mens Wear"],
  images: [
    {
      url: "https://images.example.test/shirt.jpg",
      publicId: "catalogue/shirt-primary",
      alt: "Blue cotton shirt",
    },
  ],
  variants: [
    {
      sku: " shirt blue m ",
      colour: " Blue ",
      size: " M ",
      priceInPaise: 149_900,
      inventory: 12,
    },
  ],
});

test("category names and slugs normalize to one canonical casing", async () => {
  const lower = new Category({
    name: "  sHIRTS  ",
    description: "  Tops with collars and sleeves.  ",
    image: {
      url: "https://images.example.test/shirts.jpg",
      publicId: "categories/shirts",
    },
  });
  const upper = new Category({
    name: "SHIRTS",
    description: "Shirts",
  });

  await Promise.all([lower.validate(), upper.validate()]);

  assert.equal(lower.name, "Shirts");
  assert.equal(lower.slug, "shirts");
  assert.equal(lower.description, "Tops with collars and sleeves.");
  assert.equal(lower.isActive, true);
  assert.equal(upper.slug, lower.slug);

  const slugIndex = Category.schema
    .indexes()
    .find(([, options]) => options.name === "category_slug_unique");
  assert.deepEqual(slugIndex[0], { slug: 1 });
  assert.equal(slugIndex[1].unique, true);
});

test("product model normalizes catalogue fields and stores variant-owned values", async () => {
  const product = new Product(validProductAttributes());
  await product.validate();

  assert.equal(product.name, "Everyday Cotton Shirt");
  assert.equal(product.slug, "everyday-cotton-shirt");
  assert.equal(product.brand, "Example Brand");
  assert.deepEqual(product.tags, ["summer", "mens wear"]);
  assert.equal(product.variants[0].sku, "SHIRT-BLUE-M");
  assert.equal(product.variants[0].priceInPaise, 149_900);
  assert.equal(product.variants[0].inventory, 12);
  assert.equal(product.images[0].publicId, "catalogue/shirt-primary");
  assert.equal(Product.schema.path("price"), undefined);
  assert.equal(Product.schema.path("stock"), undefined);
  assert.equal(Product.schema.path("sellerId"), undefined);
  assert.equal(Product.schema.path("category").options.ref, "Category");
  assert.equal(Product.schema.path("seller").options.ref, "User");
  assert.deepEqual(product.ratingSummary.toObject(), {
    average: 0,
    count: 0,
  });
});

test("variant prices must be positive integer paise values", async () => {
  for (const invalidPrice of [0, -100, 10.5]) {
    const attributes = validProductAttributes();
    attributes.variants[0].priceInPaise = invalidPrice;
    const product = new Product(attributes);

    await assert.rejects(
      product.validate(),
      (error) => {
        assert.ok(error.errors["variants.0.priceInPaise"]);
        return true;
      },
    );
  }
});

test("variant inventory must be a non-negative integer", async () => {
  for (const invalidInventory of [-1, 1.5]) {
    const attributes = validProductAttributes();
    attributes.variants[0].inventory = invalidInventory;
    const product = new Product(attributes);

    await assert.rejects(
      product.validate(),
      (error) => {
        assert.ok(error.errors["variants.0.inventory"]);
        return true;
      },
    );
  }
});

test("a product rejects duplicate normalized variant SKUs", async () => {
  const attributes = validProductAttributes();
  attributes.variants.push({
    ...attributes.variants[0],
    sku: "SHIRT BLUE M",
    colour: "Navy",
  });
  const product = new Product(attributes);

  await assert.rejects(
    product.validate(),
    (error) => {
      assert.match(error.errors.variants.message, /must be unique/);
      return true;
    },
  );
});

test("product indexes enforce unique slugs and SKUs and support catalogue ownership", () => {
  const indexes = Product.schema.indexes();
  const namedIndex = (name) =>
    indexes.find(([, options]) => options.name === name);

  assert.deepEqual(namedIndex("product_slug_unique")[0], { slug: 1 });
  assert.equal(namedIndex("product_slug_unique")[1].unique, true);
  assert.deepEqual(namedIndex("product_variant_sku_unique")[0], {
    "variants.sku": 1,
  });
  assert.equal(namedIndex("product_variant_sku_unique")[1].unique, true);
  assert.deepEqual(namedIndex("product_seller_status")[0], {
    seller: 1,
    status: 1,
  });
  assert.deepEqual(namedIndex("product_category_status")[0], {
    category: 1,
    status: 1,
  });
  assert.deepEqual(namedIndex("product_status_featured")[0], {
    status: 1,
    isFeatured: -1,
  });
  assert.deepEqual(PRODUCT_STATUSES, [
    "draft",
    "pending",
    "active",
    "archived",
  ]);
});
