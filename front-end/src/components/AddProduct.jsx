import React, { useState } from 'react'
import { Upload } from 'lucide-react';
import {useProductStore} from '../stores/useProductStore';

const AddProduct = () => {
  const categorys = ["jeans", "shirts", "suits", "bags", "jackets", "shoes"];
  const [newproduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "jeans",
    price: 0,
    image: null,
  });
  const {createProduct , loading} = useProductStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newproduct, image: reader.result });
      };
      reader.readAsDataURL(file);
    } else {
      setNewProduct({ ...newproduct, image: null });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted:", newproduct);
    createProduct(newproduct);
    setNewProduct({
      name: "",
      description: "",
      category: "jeans",
      price: 0,
      image: null,
    });

  };
  if (loading) {
    return (
      <div id='preloader' className='fixed inset-0 flex items-center justify-center bg-white z-50'>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow mt-10">
      <h1 className="text-3xl font-semibold mb-6 text-center">Add New Product</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-medium mb-1">Product Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={newproduct.name}
            onChange={(e) => setNewProduct({ ...newproduct, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            rows="4"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={newproduct.description}
            onChange={(e) => setNewProduct({ ...newproduct, description: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Category</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={newproduct.category}
            onChange={(e) => setNewProduct({ ...newproduct, category: e.target.value })}
          >
            {categorys.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Price (₹)</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={newproduct.price}
            onChange={(e) =>
              setNewProduct({ ...newproduct, price: parseFloat(e.target.value) })
            }
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Image</label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer flex items-center gap-2 text-sm text-purple-600 font-medium">
              <Upload size={20} /> Upload Image
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
            {newproduct.image && (
              <img
                src={newproduct.image}
                alt="preview"
                className="w-16 h-16 object-cover rounded border"
              />
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-black text-white rounded hover:bg-gray-800 transition"
        >
          Add Product
        </button>
      </form>
    </div>
  );
}

export default AddProduct
