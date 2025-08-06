import React, { useEffect } from 'react'
import { useProductStore } from '../stores/useProductStore';
import { Star, Trash } from 'lucide-react';

const ManageProducts = () => {
  const { products, toggleFeatured ,deleteProduct } = useProductStore();
  useEffect(() => {
    console.log('Products:', products);
  }, [products]);
  if (products.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow mt-10">
        <h1 className="text-2xl font-semibold mb-6 text-center">Refresh the website</h1>
      </div>
    );
  }


  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow mt-10">
      <h1 className="text-2xl font-semibold mb-6 text-center">View Products</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-200">
          <thead className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price (₹)</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3">Delete</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {products.map((product) => (
              <tr key={product._id} className="border-t hover:bg-gray-100">
                <td className="px-4 py-3">{product.name}</td>
                <td className="px-4 py-3 capitalize">{product.category}</td>
                <td className="px-4 py-3">₹ {product.price.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleFeatured(product._id)}
                    className={`p-2 rounded-full transition ${
                      product.isFeatured
                        ? "bg-yellow-400 hover:bg-yellow-500"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  >
                    <Star size={20} className="text-white" />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => deleteProduct(product._id)}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition"
                  >
                    <Trash size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageProducts
